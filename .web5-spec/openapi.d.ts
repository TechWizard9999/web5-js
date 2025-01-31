/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/did-ion/create": {
    post: operations["did_ion_create"];
  };
  "/did-ion/update": {
    post: operations["did_ion_update"];
  };
  "/did-ion/recover": {
    post: operations["did_ion_recover"];
  };
  "/did-ion/deactivate": {
    post: operations["did_ion_deactivate"];
  };
  "/did-ion/resolve": {
    post: operations["did_ion_resolve"];
  };
  "/did-ion/anchor": {
    post: operations["did_ion_anchor"];
  };
  "/did-key/create": {
    post: operations["did_key_create"];
  };
  "/did-key/resolve": {
    post: operations["did_key_resolve"];
  };
  "/credentials/presentation-exchange": {
    post: operations["credential_presentation_exchange"];
  };
  "/credentials/issue": {
    post: operations["credential_issue"];
  };
  "/crypto/generate-key/secp256k1": {
    post: operations["crypto_generate_key_secp256k1"];
  };
  "/crypto/generate-key/ed25519": {
    post: operations["crypto_generate_key_ed25519"];
  };
  "/crypto/generate-key/secp256r1": {
    post: operations["crypto_generate_key_secp256r1"];
  };
  "/crypto/verify/secp256k1": {
    post: operations["crypto_verify_secp256k1"];
  };
  "/crypto/verify/ed25519": {
    post: operations["crypto_verify_ed25519"];
  };
  "/crypto/verify/secp256r1": {
    post: operations["crypto_verify_secp256r1"];
  };
  "/crypto/jose/jws-create": {
    post: operations["crypto_jose_jws_create"];
  };
  "/crypto/jose/jws-verify": {
    post: operations["crypto_jose_jws_verify"];
  };
  "/crypto/jose/jwk-encode": {
    post: operations["crypto_jose_jwk_encode"];
  };
  "/crypto/jose/jwk-decode": {
    post: operations["crypto_jose_jwk_decode"];
  };
  "/crypto/jose/jwt-create": {
    post: operations["crypto_jose_jwt_create"];
  };
  "/crypto/jose/jwt-verify": {
    post: operations["crypto_jose_jwt_verify"];
  };
  "/crypto/key-manager/generate-key": {
    post: operations["crypto_key_manager_generate_key"];
  };
  "/crypto/key-manager/import-key": {
    post: operations["crypto_key_manager_import_key"];
  };
  "/crypto/key-manager/sign": {
    post: operations["crypto_key_manager_sign"];
  };
  "/crypto/key-manager/verify": {
    post: operations["crypto_key_manager_verify"];
  };
  "/encoders/base64/encode": {
    post: operations["encoders_base64_encode"];
  };
  "/encoders/base64/decode": {
    post: operations["encoders_base64_decode"];
  };
  "/encoders/base58/encode": {
    post: operations["encoders_base58_encode"];
  };
  "/encoders/base58/decode": {
    post: operations["encoders_base58_decode"];
  };
  "/encoders/sha256/encode": {
    post: operations["encoders_sha256_encode"];
  };
  "/encoders/cbor/encode": {
    post: operations["encoders_cbor_encode"];
  };
  "/encoders/cbor/decode": {
    post: operations["encoders_cbor_decode"];
  };
  "/ready": {
    get: operations["server_ready"];
  };
  "/shutdown": {
    get: operations["server_shutdown"];
  };
  "/": {
    get: operations["identify_self"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    CredentialIssuanceRequest: {
      credential: components["schemas"]["CredentialIssuanceRequestCredential"];
      options: components["schemas"]["CredentialIssuanceRequestOptions"];
    };
    CredentialIssuanceRequestCredential: {
      "@context": string[];
      id: string;
      type: string[];
      issuer: string;
      issuanceDate: string;
      expirationDate: string;
      credentialSubject: components["schemas"]["CredentialSubject"];
    };
    CredentialIssuanceRequestOptions: {
      created: string;
      challenge: string;
      domain: string;
      credentialStatus: components["schemas"]["CredentialStatus"];
    };
    CredentialIssuer: {
      id: string;
    };
    CredentialSubject: {
      [key: string]: unknown;
    };
    CredentialStatus: {
      type: string;
    };
    CredentialIssuanceResponse: {
      verifiableCredential: components["schemas"]["StringEncodedData"];
    };
    VerifiableCredential: {
      "@context": string[];
      id: string;
      type: string[];
      issuer: components["schemas"]["CredentialIssuer"];
      issuanceDate: string;
      expirationDate: string;
      credentialSubject: components["schemas"]["CredentialSubject"];
      proof: components["schemas"]["CredentialProof"];
    };
    CredentialProof: {
      type: string;
      created: string;
      challenge: string;
      domain: string;
      nonce: string;
      verificationMethod: string;
      proofPurpose: string;
      jws: string;
      proofValue: string;
    };
    TestServerID: {
      name: string;
      language: string;
      url: string;
    };
    DIDIonCreateResponse: {
      did: string;
    };
    StringEncodedData: {
      data: string;
    };
    PresentationExchangeRequest: {
      presentationDefinition?: components["schemas"]["PresentationDefinition"];
      vcJwts?: string[];
    };
    PresentationDefinition: {
      id?: string;
      name: string;
      purpose?: string;
      submissionRequirements?: components["schemas"]["PresentationDefinitionSubmissionRequirement"][];
      inputDescriptors: components["schemas"]["PresentationDefinitionInputDescriptor"][];
    };
    PresentationDefinitionSubmissionRequirement: {
      name?: string;
      purpose?: string;
      /** @enum {string} */
      rule: "all" | "pick";
      count?: number;
      min?: number;
      max?: number;
      from?: string;
      fromNested?: components["schemas"]["PresentationDefinitionSubmissionRequirement"][];
    };
    PresentationDefinitionInputDescriptor: {
      id: string;
      name?: string;
      purpose?: string;
      group?: string[];
      issuance?: components["schemas"]["PresentationDefinitionIssuance"][];
      constraints?: components["schemas"]["PresentationDefinitionConstraints"];
    };
    PresentationDefinitionIssuance: {
      manifest?: string;
    };
    PresentationDefinitionConstraints: {
      /** @enum {string} */
      limitDisclosure?: "required" | "preferred";
      statuses?: components["schemas"]["PresentationDefinitionStatuses"];
      fields?: components["schemas"]["PresentationDefinitionField"][];
      /** @enum {string} */
      subjectIsIssuer?: "required" | "preferred";
      isHolder?: components["schemas"]["PresentationDefinitionHolderSubject"][];
      sameSubject?: components["schemas"]["PresentationDefinitionHolderSubject"][];
    };
    PresentationDefinitionHolderSubject: {
      fieldId?: string[];
      /** @enum {string} */
      directive?: "required" | "preferred";
    };
    PresentationDefinitionField: {
      id?: string;
      path?: string[];
      purpose?: string;
      filter?: components["schemas"]["PresentationDefinitionFilter"];
      /** @enum {string} */
      predicate?: "required" | "preferred";
      name?: string;
    };
    PresentationDefinitionFilter: {
      const?: string;
      enum?: string[];
      exclusiveMinimum?: string;
      exclusiveMaximum?: string;
      format?: string;
      formatMaximum?: string;
      formatMinimum?: string;
      formatExclusiveMaximum?: string;
      formatExclusiveMinimum?: string;
      minLength?: number;
      maxLength?: number;
      minimum?: string;
      maximum?: string;
      pattern?: string;
      type?: string;
    };
    PresentationDefinitionStatuses: {
      active?: components["schemas"]["PresentationDefinitionStatus"];
      suspended?: components["schemas"]["PresentationDefinitionStatus"];
      revoked?: components["schemas"]["PresentationDefinitionStatus"];
    };
    PresentationDefinitionStatus: {
      /** @enum {string} */
      directive?: "required" | "allowed" | "disallowed";
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  did_ion_create: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["DIDIonCreateResponse"];
        };
      };
    };
  };
  did_ion_update: {
  };
  did_ion_recover: {
  };
  did_ion_deactivate: {
  };
  did_ion_resolve: {
  };
  did_ion_anchor: {
  };
  did_key_create: {
  };
  did_key_resolve: {
  };
  credential_presentation_exchange: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["PresentationExchangeRequest"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  credential_issue: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CredentialIssuanceRequest"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["CredentialIssuanceResponse"];
        };
      };
    };
  };
  crypto_generate_key_secp256k1: {
  };
  crypto_generate_key_ed25519: {
  };
  crypto_generate_key_secp256r1: {
  };
  crypto_verify_secp256k1: {
  };
  crypto_verify_ed25519: {
  };
  crypto_verify_secp256r1: {
  };
  crypto_jose_jws_create: {
  };
  crypto_jose_jws_verify: {
  };
  crypto_jose_jwk_encode: {
  };
  crypto_jose_jwk_decode: {
  };
  crypto_jose_jwt_create: {
  };
  crypto_jose_jwt_verify: {
  };
  crypto_key_manager_generate_key: {
  };
  crypto_key_manager_import_key: {
  };
  crypto_key_manager_sign: {
  };
  crypto_key_manager_verify: {
  };
  encoders_base64_encode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_base64_decode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_base58_encode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_base58_decode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_sha256_encode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_cbor_encode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  encoders_cbor_decode: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["StringEncodedData"];
      };
    };
    responses: {
      /** @description Successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["StringEncodedData"];
        };
      };
    };
  };
  server_ready: {
    responses: {
      /** @description server is ready */
      200: {
        content: never;
      };
    };
  };
  server_shutdown: {
    responses: {
      /** @description server will shut down */
      204: {
        content: never;
      };
    };
  };
  identify_self: {
    responses: {
      /** @description information about the test server */
      200: {
        content: {
          "application/json": components["schemas"]["TestServerID"];
        };
      };
    };
  };
}
