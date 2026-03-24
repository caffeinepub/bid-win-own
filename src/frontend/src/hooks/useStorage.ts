import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorage() {
  const { identity } = useInternetIdentity();

  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: loadConfig,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const config = configQuery.data;

  const getPhotoUrl = useCallback(
    (hash: string): string | null => {
      if (!config || !hash || !hash.startsWith("sha256:")) return null;
      return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
    },
    [config],
  );

  const uploadFile = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
      if (!config) throw new Error("Config not loaded");
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: config.backend_host,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(console.error);
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, onProgress);
      return hash;
    },
    [config, identity],
  );

  return { getPhotoUrl, uploadFile, isReady: !!config };
}
