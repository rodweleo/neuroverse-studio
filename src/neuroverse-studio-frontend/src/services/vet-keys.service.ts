import {
  DerivedPublicKey,
  IbeCiphertext,
  IbeIdentity,
  IbeSeed,
  TransportSecretKey,
  EncryptedVetKey,
  VetKey,
} from "@dfinity/vetkeys";
import { Principal } from "@dfinity/principal";

export class VetkeysService {
  private ibePublicKey: DerivedPublicKey | undefined;
  private ibePrivateKeys: Map<string, VetKey> = new Map();

  constructor() {}

  async getIbePublicKey(canister: any): Promise<DerivedPublicKey> {
    if (this.ibePublicKey) return this.ibePublicKey;

    try {
      const result = await canister.get_ibe_public_key();
      if ("err" in result) {
        throw new Error(result.err);
      }

      const publicKeyBytes = new Uint8Array(result.ok);
      this.ibePublicKey = DerivedPublicKey.deserialize(publicKeyBytes);
      return this.ibePublicKey;
    } catch (error) {
      console.error("Error getting IBE public key:", error);
      throw error;
    }
  }

  async getMyIbePrivateKey(
    myPrincipal: Principal,
    canister: any
  ): Promise<VetKey> {
    const principalKey = myPrincipal.toString();

    if (this.ibePrivateKeys.has(principalKey)) {
      return this.ibePrivateKeys.get(principalKey)!;
    }

    try {
      const transportSecretKey = TransportSecretKey.random();
      const result = await canister.get_my_encrypted_ibe_key(
        transportSecretKey.publicKeyBytes()
      );

      if ("err" in result) {
        throw new Error(result.err);
      }

      const encryptedKeyBytes = new Uint8Array(result.ok);
      const encryptedKey = EncryptedVetKey.deserialize(encryptedKeyBytes);

      const ibePrivateKey = encryptedKey.decryptAndVerify(
        transportSecretKey,
        await this.getIbePublicKey(canister),
        new Uint8Array(myPrincipal.toUint8Array())
      );

      this.ibePrivateKeys.set(principalKey, ibePrivateKey);
      return ibePrivateKey;
    } catch (error) {
      console.error("Error getting IBE private key:", error);
      throw error;
    }
  }

  async encryptFile(
    fileData: Uint8Array,
    recipient: Principal,
    canister: any
  ): Promise<Uint8Array> {
    try {
      const publicKey = await this.getIbePublicKey(canister);
      const ciphertext = IbeCiphertext.encrypt(
        publicKey,
        IbeIdentity.fromBytes(new Uint8Array(recipient.toUint8Array())),
        fileData,
        IbeSeed.random()
      );

      return ciphertext.serialize();
    } catch (error) {
      console.error("Error encrypting file:", error);
      throw error;
    }
  }

  async decryptFile(
    myPrincipal: Principal,
    canister: any,
    encryptedFileBytes: Uint8Array
  ): Promise<Uint8Array> {
    try {
      const ibeKey = await this.getMyIbePrivateKey(myPrincipal, canister);
      const ciphertext = IbeCiphertext.deserialize(encryptedFileBytes);
      const plaintext = ciphertext.decrypt(ibeKey);
      return plaintext;
    } catch (error) {
      console.error("Error decrypting file:", error);
      throw error;
    }
  }

  // Clear cached keys (useful for testing or key rotation)
  clearCache(): void {
    this.ibePublicKey = undefined;
    this.ibePrivateKeys.clear();
  }
}

export const vetkeysService = new VetkeysService();
