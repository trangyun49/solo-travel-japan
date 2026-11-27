(function () {
  'use strict';
  const { qs, api, params, esc, getMe, requireLogin, renderMarkdown, REGION, COVERS, showAlert, setFormBusy, toast, t } = window.STJ;
  const form = qs('#write-form');
  const err = qs('#write-error');
  const body = qs('#body');
  const preview = qs('#preview');
  const editSlug = params().get('slug');

  Object.entries(REGION).forEach(([k, v]) => qs('#region').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
  qs('#covers').innerHTML =
    `<label><input type="radio" name="cover" value=""><span class="none">${t('no_image')}</span></label>` +
    COVERS.map((c, i) => `<label><input type="radio" name="cover" value="${c}"${i === 0 ? ' checked' : ''}><img src="/img/${c}" alt="${esc(c.replace('.jpg', ''))}"></label>`).join('');

  qs('#lang').value = window.STJ.lang;
  const counter = () => (qs('#char-count').textContent = body.value.length.toLocaleString());
  body.addEventListener('input', counter);

  function setMode(previewing) {
    qs('#mode-edit').setAttribute('aria-pressed', String(!previewing));
    qs('#mode-preview').setAttribute('aria-pressed', String(previewing));
    body.hidden = previewing;
    preview.hidden = !previewing;
    if (previewing) preview.innerHTML = renderMarkdown(body.value) || `<p class="note">${t('preview_empty')}</p>`;
  }
  qs('#mode-edit').addEventListener('click', () => setMode(false));
  qs('#mode-preview').addEventListener('click', () => setMode(true));

  async function init() {
    const me = await getMe();
    if (!me) return requireLogin();
    if (editSlug) {
      try {
        const d = await api('/posts/' + encodeURIComponent(editSlug));
        if (!d.canEdit) {
          form.outerHTML = `<div class="empty"><b>${t('cannot_edit')}</b>${t('cannot_edit2')}</div>`;
          return;
        }
        const p = d.post;
        qs('#write-title').textContent = t('edit_title');
        document.title = t('edit_title') + t('suffix');
        qs('#title').value = p.title;
        qs('#category').value = p.category;
        qs('#region').value = p.region || '';
        qs('#season').value = p.season || 'all';
        qs('#lang').value = p.lang || 'ja';
        qs('#excerpt').value = p.excerpt || '';
        body.value = p.body;
        const radio = form.querySelector(`input[name="cover"][value="${CSS.escape(p.cover || '')}"]`);
        if (radio) radio.checked = true;
        qs('#submit-btn').textContent = t('update');
        qs('#cancel-link').href = '/post?slug=' + encodeURIComponent(editSlug);
      } catch (e) {
        form.outerHTML = `<div class="empty"><b>${esc(e.message)}</b></div>`;
        return;
      }
    }
    counter();
    form.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: qs('#title').value,
      category: qs('#category').value,
      region: qs('#region').value,
      season: qs('#season').value,
      lang: qs('#lang').value,
      excerpt: qs('#excerpt').value,
      cover: (form.querySelector('input[name="cover"]:checked') || {}).value || '',
      body: body.value,
    };
    if (data.title.trim().length < 4) return showAlert(err, t('err_title_min'));
    if (data.body.trim().length < 30) return showAlert(err, t('err_body_min'));
    showAlert(err, '');
    setFormBusy(form, true);
    try {
      const res = editSlug
        ? await api('/posts/' + encodeURIComponent(editSlug), { method: 'PUT', body: data })
        : await api('/posts', { method: 'POST', body: data });
      toast(editSlug ? t('post_updated') : t('published'));
      location.href = '/post?slug=' + encodeURIComponent(res.slug);
    } catch (e2) {
      if (e2.status === 401) return requireLogin();
      showAlert(err, e2.message);
      setFormBusy(form, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  init();
})();
