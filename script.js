(function () {
  const pixInput = document.getElementById("pix-key");
  const copyBtn = document.getElementById("btn-copiar-pix");
  const copyBtnText = copyBtn?.querySelector(".btn-copy-text");
  const pixFeedback = document.getElementById("pix-feedback");
  const shareBtn = document.getElementById("btn-compartilhar");
  const toast = document.getElementById("toast");

  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.hidden = true;
      }, 300);
    }, 2800);
  }

  async function copyPix() {
    const key = pixInput?.value?.trim();
    if (!key) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(key);
      } else {
        pixInput.select();
        pixInput.setSelectionRange(0, key.length);
        document.execCommand("copy");
      }

      if (copyBtnText) copyBtnText.textContent = "Copiado!";
      copyBtn?.classList.add("is-success");
      if (pixFeedback) pixFeedback.textContent = "Chave PIX copiada. Abra o app do seu banco para colar.";
      showToast("Chave PIX copiada!");

      setTimeout(function () {
        if (copyBtnText) copyBtnText.textContent = "📋 Copiar PIX";
        copyBtn?.classList.remove("is-success");
        if (pixFeedback) pixFeedback.textContent = "";
      }, 3500);
    } catch {
      if (pixFeedback) {
        pixFeedback.textContent = "Não foi possível copiar automaticamente. Selecione a chave e copie manualmente.";
      }
      pixInput?.focus();
      pixInput?.select();
    }
  }

  async function sharePage() {
    const shareData = {
      title: "Ajude Elizangela Silva Araujo",
      text: "Vaquinha solidária no tratamento contra o câncer de mama. Doe via PIX ou compartilhe o link.",
      url: "https://ajuda-elizangela.netlify.app/",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link da página copiado!");
    } catch {
      showToast("Copie o endereço da barra do navegador para compartilhar.");
    }
  }

  copyBtn?.addEventListener("click", copyPix);
  shareBtn?.addEventListener("click", sharePage);
})();
