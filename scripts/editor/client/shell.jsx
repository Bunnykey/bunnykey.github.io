import React from 'react';
import {Theme, Button, TextField} from '@radix-ui/themes';
// Build-time shell. app.js owns document state and native dialog lifecycles.
// Keep the shell unhydrated so React cannot overwrite Tiptap or unsaved input.
export default function StudioShell(){return <Theme id="studio-theme" accentColor="sage" grayColor="olive" radius="small" scaling="100%">

    <div id="app">
      <aside id="sidebar">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">BUNNYKEY</p>
            <h1>내 글</h1>
          </div>
          <div className="header-actions">
            <Button size="2" variant="surface" id="theme-toggle" className="icon-btn" aria-label="화면 테마 바꾸기" title="화면 테마 바꾸기">◐</Button>
            <Button size="2" variant="surface" id="sidebar-toggle" className="icon-btn mobile-only" aria-label="글 목록 접기" title="글 목록 접기">☰</Button>
          </div>
          <Button size="2" variant="solid" id="new-post" className="btn-primary">+ 새 글 쓰기</Button>
        </div>
        <div className="sidebar-git" hidden aria-label="저장소 상태">
          <span id="git-branch"></span><span id="git-changes"></span>
        </div>
        <label htmlFor="local-drafts">이 기기의 미저장 글</label><select id="local-drafts"><option value="">복원할 글 선택</option></select>
        <div id="post-list"></div>
      </aside>

      <main id="main">
        <header id="topbar">
          <div className="writing-header">
            <div className="title-wrap">
              <TextField.Root id="fm-title" type="text" placeholder="제목을 입력하세요" aria-label="글 제목" />
              <TextField.Root id="fm-summary" type="text" placeholder="한 줄 소개를 적어보세요 (선택)" aria-label="글 요약" />
            </div>
            <div className="publish-actions">
              <Button size="2" variant="surface" id="preview-toggle" className="btn-secondary" aria-pressed="false">미리보기</Button>
              <Button size="2" variant="surface" id="compare-conflict" className="btn-secondary" hidden>최신본 비교</Button>
              <Button size="2" variant="surface" id="save" className="btn-secondary" title="임시 저장 (Ctrl+S)">임시 저장</Button>
              <Button size="2" variant="solid" id="publish" className="btn-primary" title="공개하고 GitHub에 발행">발행하기</Button>
            </div>
          </div>

          <details className="post-settings">
            <summary>글 설정</summary>
            <div className="fm-row">
              <label>분류
                <select id="fm-collection">
                  <option value="seeds">짧은 기록 (seeds)</option>
                  <option value="flora">긴 글 (flora)</option>
                  <option value="nursery">프로젝트 (nursery)</option>
                </select>
              </label>
              <label>주제<select id="fm-category"><option value="notes">기록</option><option value="life">일상</option><option value="food">요리</option><option value="music">음악</option><option value="travel">여행</option><option value="tech">기술</option></select></label>
              <label>프로젝트 단계<select id="fm-stage"><option value="">해당 없음</option><option value="seed">시작</option><option value="growing">진행</option><option value="evergreen">유지</option></select></label>
              <label>시리즈 주소<TextField.Root id="fm-series-name" placeholder="예: making-music" /></label>
              <label>시리즈 제목<TextField.Root id="fm-series-title" /></label>
              <label>시리즈 순서<TextField.Root id="fm-series-order" type="number" min="1" step="1" /></label>
              <label>주소
                <TextField.Root id="fm-slug" type="text" placeholder="자동으로 만들어집니다" />
                <span id="slug-warn" className="warn"></span>
              </label>
              <label>날짜
                <TextField.Root id="fm-date" type="date" />
              </label>
              <label>태그
                <TextField.Root id="fm-tags" type="text" list="tag-suggestions" placeholder="예: 일상, 책, 사진" />
                <datalist id="tag-suggestions"></datalist>
              </label>
              <label className="check" hidden><input id="fm-draft" type="checkbox" defaultChecked /> 초안</label><p>저장은 작업 초안을 보관합니다. 공개 사이트에는 발행 후 반영됩니다.</p>
              <label className="advanced-setting">데모
                <select id="fm-demo"><option value="">없음</option></select>
              </label>
            </div>
          </details>
        </header>

        <nav id="toolbar" aria-label="글쓰기 도구">
          <Button size="2" variant="surface" data-action="bold" title="굵게 (Ctrl+B)"><b>B</b></Button>
          <Button size="2" variant="surface" data-action="italic" title="기울임 (Ctrl+I)"><i>I</i></Button>
          <Button size="2" variant="surface" data-action="link" title="링크">링크</Button>
          <Button size="2" variant="surface" id="media-insert" title="Spotify, YouTube, GitHub 링크 넣기">미디어</Button>
          <Button size="2" variant="surface" id="mode-toggle" aria-pressed="false">Markdown</Button>
          <Button size="2" variant="surface" data-action="image" title="사진 넣기">사진</Button>
          <Button size="2" variant="surface" data-action="h2">소제목</Button>
          <Button size="2" variant="surface" data-action="table">표</Button>
          <Button size="2" variant="surface" data-action="code" className="advanced-setting">코드</Button>
          <select id="insert-demo" className="advanced-setting"><option value="">+ 데모 삽입</option></select>
          <label className="toolbar-toggle advanced-setting"><input id="ai-toggle" type="checkbox" /> AI</label>
          <span className="spacer"></span>
          <span id="word-count"></span><span id="ext-badge" className="advanced-setting"></span>
          <Button size="2" variant="surface" id="delete-post" className="btn-danger" title="저장한 작업 초안만 버리기">초안 버리기</Button>
        </nav>

        <div id="split">
          <section id="editor-pane" aria-label="글 작성">
            <div id="rich-editor"></div>
            <div id="editor-stack" hidden>
              <div id="ghost" aria-hidden="true"></div>
              <textarea id="editor" spellCheck="true" placeholder="편하게 이야기를 시작해 보세요.&#10;&#10;사진은 위의 ‘사진’ 버튼을 누르거나, 이곳에 끌어다 놓으면 됩니다."></textarea>
            </div>
            <div id="ai-status" hidden></div>
          </section>
          <div id="divider" title="끌어서 편집 영역 크기 조절"></div>
          <section id="preview-pane" aria-label="미리보기">
            <p className="pane-label">미리보기</p>
            <header className="reading-header"><p id="preview-date" className="reading-meta"></p><h1 id="preview-title" className="reading-title"></h1><p id="preview-summary" className="reading-summary"></p></header><div id="toc" hidden></div><article id="preview" className="journal-prose"></article>
          </section>
        </div>

        <footer id="status" role="status" aria-live="polite"><span id="status-msg">준비됨</span><span className="spacer"></span><span id="reading-time"></span></footer>
      </main>
    </div>
    <div id="find-overlay" className="overlay" hidden><div className="overlay-box"><div className="overlay-row"><TextField.Root id="find-input" type="text" placeholder="찾기" /><span id="find-count">0/0</span><Button size="2" variant="surface" id="find-prev">이전</Button><Button size="2" variant="surface" id="find-next">다음</Button></div><div className="overlay-row"><TextField.Root id="replace-input" type="text" placeholder="바꾸기" /><Button size="2" variant="surface" id="replace-one">바꾸기</Button><Button size="2" variant="surface" id="replace-all">모두 바꾸기</Button><Button size="2" variant="surface" id="find-close">닫기</Button></div></div></div>
    <dialog id="conflict-dialog"><h2>수정 충돌 확인</h2><p>최신 서버 내용과 현재 입력을 비교하세요. 닫은 뒤 본문·글 설정에서 직접 병합하고 다시 비교할 수 있습니다. 저장 버튼은 현재 입력한 본문과 설정을 병합 결과로 사용합니다.</p><label>최신 서버 내용<textarea id="conflict-latest" readOnly rows="8"></textarea></label><label>현재 입력 내용<textarea id="conflict-local" readOnly rows="8"></textarea></label><Button size="2" variant="surface" id="conflict-close">닫고 수정</Button><Button size="2" variant="surface" id="conflict-merge">현재 입력을 병합본으로 저장</Button></dialog>
    <dialog id="media-dialog"><form id="media-form"><h2>미디어 넣기</h2><p>Spotify · YouTube / YouTube Music · GitHub</p><label htmlFor="media-url">미디어 주소</label><TextField.Root id="media-url" type="url" required placeholder="https://..." /><p id="media-error" role="alert"></p><div className="dialog-actions"><Button size="2" variant="surface" type="button" id="media-cancel">취소</Button><Button size="2" variant="surface" type="submit" className="btn-primary">넣기</Button></div></form></dialog>
    <input type="file" id="file-input" accept="image/*" hidden />
    
</Theme>;}
