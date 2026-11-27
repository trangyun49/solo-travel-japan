(function () {
  'use strict';
  const { qs, api, params, getMe, showAlert, setFormBusy, t } = window.STJ;
  const form = qs('#login-form');
  const err = qs('#auth-error');
  const mode = form.dataset.mode;

  // Only allow same-site relative redirects.
  const rawNext = params().get('next') || '';
  const next = /^\/(?!\/)[^\s]*$/.test(rawNext) && !/^\/(login|register)/.test(rawNext) ? rawNext : '/account';
  if (rawNext) qs('#switch-link').href += '?next=' + encodeURIComponent(next);

  getMe().then((me) => {
    if (me) location.replace(next);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#email').value.trim();
    const password = qs('#password').value;
    const body = { email, password };
    let msg = '';
    if (mode === 'register') {
      body.displayName = qs('#displayName').value.trim();
      if (!body.displayName) msg = t('err_nick');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) msg = t('err_email');
      else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) msg = t('err_pw');
    } else if (!email || !password) {
      msg = t('err_login_empty');
    }
    if (msg) return showAlert(err, msg);
    showAlert(err, '');
    setFormBusy(form, true);
    try {
      await api(mode === 'register' ? '/auth/register' : '/auth/login', { method: 'POST', body });
      location.href = next;
    } catch (e2) {
      showAlert(err, e2.message);
      setFormBusy(form, false);
    }
  });
})();
