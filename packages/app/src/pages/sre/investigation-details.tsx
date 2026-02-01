import { useParams, A } from "@solidjs/router";

export default function InvestigationDetails() {
  const params = useParams();

  return (
    <div class="p-6">
      <div class="flex items-center gap-2 text-[12px] text-[rgb(var(--aui-color-n-4))] mb-4">
        <A 
          href="/sre" 
          class="hover:text-[var(--aui-color-primary)] transition-colors"
        >
          Investigations
        </A>
        <span>/</span>
        <span class="text-[rgb(var(--aui-color-n-1))]">{params.id}</span>
      </div>

      <h1 class="text-[20px] font-semibold text-[rgb(var(--aui-color-n-1))] mb-6">
        Investigation {params.id}
      </h1>

      <div class="flex gap-6">
        <div class="sre-card flex-1 min-h-[600px] flex flex-col items-center justify-center text-center">
          <h2 class="text-[16px] font-medium text-[rgb(var(--aui-color-n-1))] mb-2">
            Agent Chat
          </h2>
          <p class="text-[14px] text-[rgb(var(--aui-color-n-4))]">
            OpenCode session will be embedded here
          </p>
        </div>

        <div class="sre-card w-[400px] min-h-[600px] flex flex-col items-center justify-center text-center">
          <h2 class="text-[16px] font-medium text-[rgb(var(--aui-color-n-1))] mb-2">
            Overview
          </h2>
          <p class="text-[14px] text-[rgb(var(--aui-color-n-4))]">
            Hypothesis flow diagram will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}
