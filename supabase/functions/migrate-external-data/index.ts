import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { external_url, external_key } = await req.json();

    const externalClient = createClient(external_url, external_key);
    const internalClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: Record<string, { status: string; count?: number; message?: string }> = {};

    // Get existing contato IDs in internal DB
    const { data: existingContatos } = await internalClient.from("contatos").select("id");
    const contatoIds = new Set((existingContatos || []).map(c => c.id));

    // Get existing condominio IDs
    const { data: existingCondominios } = await internalClient.from("condominios").select("id");
    const condominioIds = new Set((existingCondominios || []).map(c => c.id));

    // Fetch trabalhos from external
    const { data: trabalhosData, error: trabError } = await externalClient.from("trabalhos").select("*");
    if (trabError) {
      results.trabalhos = { status: "error_read", message: trabError.message };
    } else if (!trabalhosData || trabalhosData.length === 0) {
      results.trabalhos = { status: "empty", count: 0 };
    } else {
      // Clean foreign keys that don't exist
      const cleaned = trabalhosData.map(t => ({
        ...t,
        cliente_id: t.cliente_id && contatoIds.has(t.cliente_id) ? t.cliente_id : null,
        sindico_id: t.sindico_id && contatoIds.has(t.sindico_id) ? t.sindico_id : null,
        condominio_id: t.condominio_id && condominioIds.has(t.condominio_id) ? t.condominio_id : null,
      }));

      const { error: insertError } = await internalClient.from("trabalhos").upsert(cleaned, { onConflict: "id" });
      if (insertError) {
        results.trabalhos = { status: "error_write", message: insertError.message, count: cleaned.length };
      } else {
        results.trabalhos = { status: "ok", count: cleaned.length };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
