import type { Readable } from 'readable-stream';
import type { Web5Agent } from '@tbd54566975/web5-agent';
import type { RecordsReadReply, RecordsWriteDescriptor, RecordsWriteMessage, RecordsWriteOptions } from '@tbd54566975/dwn-sdk-js';

import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { DataStream, DwnInterfaceName, DwnMethodName, Encoder } from '@tbd54566975/dwn-sdk-js';

import { dataToBytes, isDataSizeUnderCacheLimit } from './utils.js';
import type { RecordsDeleteResponse } from './dwn-api.js';

export type RecordOptions = RecordsWriteMessage & {
  author: string;
  target: string;
  encodedData?: string | Uint8Array;
  data?: Readable | ReadableStream;
};

export type RecordModel = RecordsWriteDescriptor & Omit<RecordsWriteMessage, 'descriptor' | 'recordId'> & {
  author: string;
  recordId?: string;
  target: string;
}

export type RecordUpdateOptions = {
  data?: unknown;
  dataCid?: RecordsWriteDescriptor['dataCid'];
  dataSize?: RecordsWriteDescriptor['dataSize'];
  dateModified?: RecordsWriteDescriptor['dateModified'];
  datePublished?: RecordsWriteDescriptor['datePublished'];
  published?: RecordsWriteDescriptor['published'];
}

/**
   * TODO: Document class.
   */
export class Record implements RecordModel {
  // mutable properties
  author: string;
  target: string;
  isDeleted = false;

  #attestation?: RecordsWriteMessage['attestation'];
  #contextId?: string;
  #descriptor: RecordsWriteDescriptor;
  #encodedData?: string | Uint8Array | null;
  #encryption?: RecordsWriteMessage['encryption'];
  #readableStream?: Readable | Promise<Readable>;
  #recordId: string;
  #web5Agent: Web5Agent;

  // Immutable DWN Record properties.
  get attestation(): RecordsWriteMessage['attestation'] { return this.#attestation; }
  get contextId() { return this.#contextId; }
  get dataFormat() { return this.#descriptor.dataFormat; }
  get dateCreated() { return this.#descriptor.dateCreated; }
  get encryption(): RecordsWriteMessage['encryption'] { return this.#encryption; }
  get id() { return this.#recordId; }
  get interface() { return this.#descriptor.interface; }
  get method() { return this.#descriptor.method; }
  get parentId() { return this.#descriptor.parentId; }
  get protocol() { return this.#descriptor.protocol; }
  get protocolPath() { return this.#descriptor.protocolPath; }
  get recipient() { return this.#descriptor.recipient; }
  get schema() { return this.#descriptor.schema; }

  // Mutable DWN Record properties.
  get dataCid() { return this.#descriptor.dataCid; }
  get dataSize() { return this.#descriptor.dataSize; }
  get dateModified() { return this.#descriptor.dateModified; }
  get datePublished() { return this.#descriptor.datePublished; }
  get published() { return this.#descriptor.published; }

  constructor(web5Agent: Web5Agent, options: RecordOptions) {
    this.#web5Agent = web5Agent;

    // Store the target and author DIDs that were used to create the message to use for subsequent reads, etc.
    this.author = options.author;
    this.target = options.target;

    // RecordsWriteMessage properties.
    this.#attestation = options.attestation;
    this.#contextId = options.contextId;
    this.#descriptor = options.descriptor;
    this.#encryption = options.encryption;
    this.#recordId = options.recordId;

    // If the record `dataSize is less than the DwnConstant.maxDataSizeAllowedToBeEncoded value,
    // then an `encodedData` property will be present.
    this.#encodedData = options.encodedData ?? null;

    // If the record was created from a RecordsRead reply then it will have a `data` property.
    if (options.data) {
      this.#readableStream = Record.isReadableWebStream(options.data) ?
        new ReadableWebToNodeStream(<ReadableStream>options.data) as Readable : options.data as Readable;
    }
  }

  /**
   * TODO: Document method.
   */
  get data() {
    if (this.isDeleted) throw new Error(`Error: Record with ID '${this.id}' was previously deleted.`);

    if (!this.#encodedData && !this.#readableStream) {
      // `encodedData` will be set if `dataSize` <= DwnConstant.maxDataSizeAllowedToBeEncoded. (10KB as of April 2023)
      // `readableStream` will be set if Record was instantiated from a RecordsRead reply.
      // If neither of the above are true, then the record must be fetched from the DWN.
      this.#readableStream = this.#web5Agent.processDwnRequest({
        author         : this.author,
        messageOptions : { recordId: this.id },
        messageType    : DwnInterfaceName.Records + DwnMethodName.Read,
        target         : this.target,
      })
        .then(response => response.reply as RecordsReadReply)
        .then(reply => reply.record.data as Readable)
        .catch(error => { throw new Error(`Error encountered while attempting to read data: ${error.message}`); });
    }

    if (typeof this.#encodedData === 'string') {
      // If `encodedData` is set, then it is expected that:
      // `dataSize` <= DwnConstant.maxDataSizeAllowedToBeEncoded (10KB as of April 2023)
      // type is Uint8Array bytes if the Record object was instantiated from a RecordsWrite response
      // type is Base64 URL encoded string if the Record object was instantiated from a RecordsQuery response
      // If it is a string, we need to Base64 URL decode to bytes
      this.#encodedData = Encoder.base64UrlToBytes(this.#encodedData);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this; // Capture the context of the `Record` instance.
    const dataObj = {
      async json() {
        if (self.#encodedData) return this.text().then(JSON.parse);
        if (self.#readableStream) return this.text().then(JSON.parse);
        return null;
      },
      async text() {
        if (self.#encodedData) return Encoder.bytesToString(self.#encodedData as Uint8Array);
        if (self.#readableStream) return this.stream().then(DataStream.toBytes).then(Encoder.bytesToString);
        return null;
      },
      async stream() {
        if (self.#encodedData) return DataStream.fromBytes(self.#encodedData as Uint8Array);
        if (self.#readableStream) return self.#readableStream;
        return null;
      },
      then(...callbacks) {
        return this.stream().then(...callbacks);
      },
      catch(callback) {
        return dataObj.then().catch(callback);
      },
    };
    return dataObj;
  }

  /**
   * TODO: Document method.
   */
  async delete(): Promise<RecordsDeleteResponse> {
    if (this.isDeleted) throw new Error(`Record with ID '${this.id}' was previously deleted.`);

    // Attempt to delete the record from the DWN.
    const agentResponse = await this.#web5Agent.processDwnRequest({
      author         : this.author,
      messageOptions : { recordId: this.id },
      messageType    : DwnInterfaceName.Records + DwnMethodName.Delete,
      target         : this.target,
    });

    const { reply: { status } } = agentResponse;

    if (status.code === 202) {
      // If the record was successfully deleted, mark the instance as deleted to prevent further modifications.
      this.#setDeletedStatus(true);
    }

    return { status };
  }

  /**
   * TODO: Document method.
   *
   * Called by `JSON.stringify(...)` automatically.
   */
  toJSON(): RecordModel {
    return {
      attestation   : this.attestation,
      author        : this.author,
      contextId     : this.contextId,
      dataCid       : this.dataCid,
      dataFormat    : this.dataFormat,
      dataSize      : this.dataSize,
      dateCreated   : this.dateCreated,
      dateModified  : this.dateModified,
      datePublished : this.datePublished,
      encryption    : this.encryption,
      interface     : this.interface,
      method        : this.method,
      parentId      : this.parentId,
      protocol      : this.protocol,
      protocolPath  : this.protocolPath,
      published     : this.published,
      recipient     : this.recipient,
      recordId      : this.id,
      schema        : this.schema,
      target        : this.target,
    };
  }

  toString() {
    return 'hi';
  }

  /**
   * TODO: Document method.
   */
  async update(options: RecordUpdateOptions = {}) {
    if (this.isDeleted) throw new Error(`Error: Record with ID '${this.id}' was previously deleted.`);

    // Begin assembling update message.
    let updateMessage = { ...this.#descriptor, ...options } as Partial<RecordsWriteOptions>;

    let dataStream: _Readable.Readable;
    if (options.data !== undefined) {
      // If `data` is being updated then `dataCid` and `dataSize` must be undefined and the `data` property is passed as
      // a top-level property to `web5Agent.processDwnRequest()`.
      delete updateMessage.dataCid;
      delete updateMessage.dataSize;

      if (options.data instanceof Blob || options.data instanceof ReadableStream) {
        //! TODO: get dataSize and dataCid of data
      } else {
        const { dataBytes } = dataToBytes(options.data, updateMessage.dataFormat);
        updateMessage.data = dataBytes;
        dataStream = DataStream.fromBytes(dataBytes);
      }
    }

    // Throw an error if an attempt is made to modify immutable properties. `data` has already been handled.
    const mutableDescriptorProperties = new Set(['data', 'dataCid', 'dataSize', 'dateModified', 'datePublished', 'published']);
    Record.#verifyPermittedMutation(Object.keys(options), mutableDescriptorProperties);

    // If a new `dateModified` was not provided, remove it from the updateMessage to let the DWN SDK auto-fill.
    // This is necessary because otherwise DWN SDK throws an Error 409 Conflict due to attempting to overwrite a record
    // when the `dateModified` timestamps are identical.
    if (options.dateModified === undefined) {
      delete updateMessage.dateModified;
    }

    // If `published` is set to false, ensure that `datePublished` is undefined. Otherwise, DWN SDK's schema validation
    // will throw an error if `published` is false but `datePublished` is set.
    if (options.published === false && updateMessage.datePublished !== undefined) {
      delete updateMessage.datePublished;
    }

    // Set the record ID and context ID, if any.
    updateMessage.recordId = this.#recordId;
    updateMessage.contextId = this.#contextId;

    const messageOptions: Partial<RecordsWriteOptions> = {
      ...updateMessage
    };

    const agentResponse = await this.#web5Agent.processDwnRequest({
      author      : this.author,
      dataStream  : dataStream as any,
      messageOptions,
      messageType : DwnInterfaceName.Records + DwnMethodName.Write,
      target      : this.target,
    });

    const { message, reply: { status } } = agentResponse;
    const responseMessage = message as RecordsWriteMessage;

    if (200 <= status.code && status.code <= 299) {
      // Only update the local Record instance mutable properties if the record was successfully (over)written.
      mutableDescriptorProperties.forEach(property => {
        this.#descriptor[property] = responseMessage.descriptor[property];
      });
      // Only cache data if `dataSize` is less than DWN 'max data size allowed to be encoded'.
      if (updateMessage.data !== undefined) {
        this.#readableStream = isDataSizeUnderCacheLimit(responseMessage.descriptor.dataSize) ? DataStream.fromBytes(updateMessage.data) : null;
        this.#encodedData = null; // Clear `encodedData` in case it was previously set.
      }
    }

    return { status };
  }

  /**
   * TODO: Document method.
   */
  #setDeletedStatus(status: boolean): void {
    this.isDeleted = status;
  }

  /**
   * TODO: Document method.
   */
  static isReadableWebStream(stream) {
    // TODO: Improve robustness of the check modeled after node:stream.
    return typeof stream._read !== 'function';
  }

  /**
   * TODO: Document method.
   */
  static #verifyPermittedMutation(propertiesToMutate: Iterable<string>, mutableDescriptorProperties: Set<string>) {
    for (const property of propertiesToMutate) {
      if (!mutableDescriptorProperties.has(property)) {
        throw new Error(`${property} is an immutable property. Its value cannot be changed.`);
      }
    }
  }
}