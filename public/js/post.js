(function () {
  'use strict';
  const { qs, api, params, esc, icon, renderMarkdown, postCard, fmtDate, POST_CAT, REGION, SEASON, toast } = window.STJ;
  const root = qs('#post');
  const slug = params().get('slug');

  async function load() {
    if (!slug) {
      root.innerHTML = '<div class="empty"><b>記事が指定されていません</b><a href="/blog">ブログ一覧へ</a></div>';
      return;
    }
    let d;
    try {
      d = await api('/posts/' + encodeURIComponent(slug));
    } catch (err) {
      root.innerHTML = `<div class="empty"><b>${esc(err.message)}</b><a href="/blog">ブログ一覧へ戻る</a></div>`;
      return;
    }
    const p = d.post;
    document.title = `${p.title}｜ひとり旅ジャパン`;
    const edited = p.updated_at && p.updated_at !== p.created_at ? `（${fmtDate(p.updated_at)} 更新）` : '';
    root.innerHTML = `
      <article class="article">
        <nav class="crumbs" aria-label="パンくず"><a href="/">ホーム</a> ／ <a href="/blog">ブログ</a> ／ <a href="/blog?category=${p.category}">${esc(POST_CAT[p.category])}</a></nav>
        <h1 class="page-title-lg">${esc(p.title)}</h1>
        <div class="byline">
          <span class="avatar">${esc(p.author_name.slice(0, 1))}</span>
          <span>${esc(p.author_name)}${p.author_id ? '' : '（ひとり旅ジャパン）'}</span>
          <span>${fmtDate(p.created_at)}${edited}</span>
          <span class="tags">
            <a class="tag" href="/blog?category=${p.category}">${esc(POST_CAT[p.category])}</a>
            ${p.region ? `<a class="tag" href="/blog?region=${p.region}">${esc(REGION[p.region])}</a>` : ''}
            ${p.season && p.season !== 'all' ? `<a class="tag" href="/blog?season=${p.season}">${SEASON[p.season]}</a>` : ''}
          </span>
        </div>
        ${p.cover ? `<div class="article-cover"><img src="/img/${esc(p.cover)}" alt=""></div>` : '<div class="mt"></div>'}
        <div class="prose">${renderMarkdown(p.body)}</div>
        ${
          d.canEdit
            ? `<div class="post-actions"><a class="btn btn-outline" href="/write?slug=${encodeURIComponent(p.slug)}">${icon('pen')} 編集する</a><button class="btn btn-danger" type="button" id="delete-post">削除する</button></div>`
            : ''
        }
      </article>
      ${d.related.length ? `<section class="section"><div class="section-head"><h2>関連する記事</h2></div><div class="post-grid">${d.related.map(postCard).join('')}</div></section>` : ''}`;

    const del = qs('#delete-post');
    if (del) {
      del.addEventListener('click', async () => {
        if (!confirm('この記事を削除します。元に戻せません。よろしいですか？')) return;
        del.disabled = true;
        try {
          await api('/posts/' + encodeURIComponent(p.slug), { method: 'DELETE', body: {} });
          toast('記事を削除しました');
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
