(function () {
  'use strict';
  const { qs, api, params, esc, icon, renderMarkdown, postCard, fmtDate, POST_CAT, REGION, SEASON, toast, t, lang, postTitle, authorName } = window.STJ;
  const root = qs('#post');
  const slug = params().get('slug');

  async function load() {
    if (!slug) {
      root.innerHTML = `<div class="empty"><a href="/blog">${t('back_blog')}</a></div>`;
      return;
    }
    let d;
    try {
      d = await api('/posts/' + encodeURIComponent(slug));
    } catch (err) {
      root.innerHTML = `<div class="empty"><b>${esc(err.message)}</b><a href="/blog">${t('back_blog')}</a></div>`;
      return;
    }
    const p = d.post;
    const title = postTitle(p);
    document.title = `${title}${t('suffix')}`;
    const edited = p.updated_at && p.updated_at !== p.created_at ? ` (${t('updated', { d: fmtDate(p.updated_at) })})` : '';
    root.innerHTML = `
      <article class="article">
        <nav class="crumbs" aria-label="breadcrumb"><a href="/">${t('home')}</a> ／ <a href="/blog">${t('nav_blog')}</a> ／ <a href="/blog?category=${p.category}">${esc(POST_CAT[p.category])}</a></nav>
        <h1 class="page-title-lg">${esc(title)}</h1>
        ${lang !== 'ja' && title !== p.title ? `<p class="card-sub" lang="ja">${esc(p.title)}</p>` : ''}
        <div class="byline">
          <span class="avatar">${esc(authorName(p).slice(0, 1))}</span>
          <span>${esc(authorName(p))}</span>
          <span>${fmtDate(p.created_at)}${edited}</span>
          <span class="tags">
            <a class="tag" href="/blog?category=${p.category}">${esc(POST_CAT[p.category])}</a>
            ${p.region ? `<a class="tag" href="/blog?region=${p.region}">${esc(REGION[p.region])}</a>` : ''}
            ${p.season && p.season !== 'all' ? `<a class="tag" href="/blog?season=${p.season}">${SEASON[p.season]}</a>` : ''}
          </span>
        </div>
        ${p.cover ? `<div class="article-cover"><img src="/img/${esc(p.cover)}" alt=""></div>` : '<div class="mt"></div>'}
        ${lang !== 'ja' && !p.author_id ? `<p class="alert alert-info">${t('ja_only')}</p>` : ''}
        <div class="prose">${renderMarkdown(p.body)}</div>
        ${
          d.canEdit
            ? `<div class="post-actions"><a class="btn btn-outline" href="/write?slug=${encodeURIComponent(p.slug)}">${icon('pen')} ${t('edit')}</a><button class="btn btn-danger" type="button" id="delete-post">${t('del')}</button></div>`
            : ''
        }
      </article>
      ${d.related.length ? `<section class="section"><div class="section-head"><h2>${t('related_posts')}</h2></div><div class="post-grid">${d.related.map(postCard).join('')}</div></section>` : ''}`;

    const del = qs('#delete-post');
    if (del) {
      del.addEventListener('click', async () => {
        if (!confirm(t('confirm_delete_post'))) return;
        del.disabled = true;
        try {
          await api('/posts/' + encodeURIComponent(p.slug), { method: 'DELETE', body: {} });
          toast(t('post_deleted'));
          setTimeout(() => (location.href = '/account?tab=posts'), 700);
        } catch (err) {
          toast(err.message);
          del.disabled = false;
        }
      });
    }
  }
  load();
})();
