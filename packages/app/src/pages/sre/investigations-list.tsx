export default function InvestigationsList() {
  return (
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-[20px] font-semibold text-[rgb(var(--aui-color-n-1))]">
          Investigations
        </h1>
        <button class="sre-btn-primary">Start Investigation</button>
      </div>

      <div class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-[rgb(var(--aui-color-n-6))]">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h2 class="text-[16px] font-medium text-[rgb(var(--aui-color-n-2))] mt-4">
          No investigations yet
        </h2>
        <p class="text-[14px] text-[rgb(var(--aui-color-n-4))] mt-2 mb-6">
          Start your first investigation to begin analyzing incidents
        </p>
        <button class="sre-btn-primary">Start Investigation</button>
      </div>
    </div>
  );
}
