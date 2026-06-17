document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const exportBtn = document.getElementById('export-btn');
    const searchInput = document.getElementById('search-input');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const notesContainer = document.getElementById('notes-container');
    const loader = document.getElementById('loader');
    
    const composerEmpty = document.getElementById('composer-empty-state');
    const composerActive = document.getElementById('composer-active-state');
    const previewCategory = document.getElementById('preview-category');
    const previewTitle = document.getElementById('preview-title');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const tweetBtn = document.getElementById('tweet-btn');

    let allNotes = [];
    let selectedNote = null;
    let currentCategory = 'all';

    // Fetch Release Notes from API
    async function fetchReleaseNotes() {
        showLoader(true);
        refreshIcon.classList.add('spinning');
        try {
            const response = await fetch('/api/release-notes');
            const data = await response.json();
            
            if (data.success) {
                allNotes = data.notes;
                renderNotes();
            } else {
                showError(data.error || 'Failed to fetch release notes.');
            }
        } catch (error) {
            showError('Network error occurred while fetching release notes.');
            console.error(error);
        } finally {
            showLoader(false);
            refreshIcon.classList.remove('spinning');
        }
    }

    function showLoader(show) {
        if (show) {
            loader.classList.remove('hidden');
            // Remove previous cards while loading
            const cards = notesContainer.querySelectorAll('.note-card, .empty-feed');
            cards.forEach(card => card.remove());
        } else {
            loader.classList.add('hidden');
        }
    }

    function showError(message) {
        notesContainer.innerHTML = `
            <div class="empty-feed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--badge-deprecation-text)">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>${message}</p>
                <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    // Get current filtered notes
    function getFilteredNotes() {
        const query = searchInput.value.toLowerCase().trim();
        return allNotes.filter(note => {
            const matchesCategory = currentCategory === 'all' || note.category === currentCategory;
            const matchesSearch = note.title.toLowerCase().includes(query) || note.plain_text.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }

    // Render filtered/searched list of notes
    function renderNotes() {
        // Clear previous cards
        const cards = notesContainer.querySelectorAll('.note-card, .empty-feed');
        cards.forEach(card => card.remove());

        const filtered = getFilteredNotes();

        if (filtered.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-feed';
            emptyEl.innerHTML = '<p>No release notes found matching your criteria.</p>';
            notesContainer.appendChild(emptyEl);
            return;
        }

        filtered.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            if (selectedNote && selectedNote.id === note.id) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="note-card-header">
                    <h3 class="note-card-title">${note.title}</h3>
                </div>
                <div class="note-meta">
                    <span class="badge ${note.category.toLowerCase()}">${note.category}</span>
                    <span class="note-date">${formatDate(note.published)}</span>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
                <div class="note-card-footer">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-grow: 1;">
                        <span class="select-hint">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            Click to compose Tweet
                        </span>
                        <span class="selected-indicator">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px; color: var(--accent-color)"><polyline points="20 6 9 17 4 12"/></svg>
                            Selected for Tweet
                        </span>
                    </div>
                    <button class="btn btn-secondary copy-card-btn" style="padding: 0.35rem 0.7rem; font-size: 0.75rem; flex-shrink: 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        <span>Copy</span>
                    </button>
                </div>
            `;

            // Select card listener
            card.addEventListener('click', () => {
                selectNoteForTweet(note);
                // Update selected styles visually
                notesContainer.querySelectorAll('.note-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            // Copy to Clipboard listener
            const copyBtn = card.querySelector('.copy-card-btn');
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop click from triggering parent card selection
                const shareText = `${note.title}\n\n${note.plain_text}\n\nRead more: ${note.link}`;
                navigator.clipboard.writeText(shareText).then(() => {
                    const btnSpan = copyBtn.querySelector('span');
                    btnSpan.textContent = 'Copied!';
                    copyBtn.classList.remove('btn-secondary');
                    copyBtn.classList.add('btn-primary');
                    setTimeout(() => {
                        btnSpan.textContent = 'Copy';
                        copyBtn.classList.add('btn-secondary');
                        copyBtn.classList.remove('btn-primary');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });

            notesContainer.appendChild(card);
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            // Parses common date formats in RSS (like RFC 822 or ISO)
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    // Compose Tweet Section
    function selectNoteForTweet(note) {
        selectedNote = note;
        
        // Setup visual elements
        composerEmpty.classList.add('hidden');
        composerActive.classList.remove('hidden');
        
        previewCategory.className = `badge ${note.category.toLowerCase()}`;
        previewCategory.textContent = note.category;
        previewTitle.textContent = note.title;

        // Draft Twitter share text
        // Clean title and shorten text to fit nicely in 280 chars
        const intro = `BigQuery Update: ${note.title}\n\n`;
        const link = note.link ? `\n\nRead more: ${note.link}` : '';
        const hashtags = ` #BigQuery #GoogleCloud #Data`;
        
        // Calculate limit for detail content
        const baseLength = intro.length + link.length + hashtags.length;
        const maxContentLength = 280 - baseLength;
        
        let detail = note.plain_text;
        if (detail.length > maxContentLength) {
            detail = detail.substring(0, maxContentLength - 3) + '...';
        }

        tweetTextarea.value = `${intro}${detail}${link}${hashtags}`;
        updateCharCount();
    }

    // Character Counter
    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCount.textContent = len;
        if (len > 280) {
            charCount.classList.add('warning');
            tweetBtn.disabled = true;
        } else {
            charCount.classList.remove('warning');
            tweetBtn.disabled = false;
        }
    }

    tweetTextarea.addEventListener('input', updateCharCount);

    // Tweet / X Button Trigger
    tweetBtn.addEventListener('click', () => {
        if (!tweetTextarea.value || tweetTextarea.value.length > 280) return;
        
        // Open Tweet Intent URL in new tab
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTextarea.value)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    });

    // Refresh Button Event
    refreshBtn.addEventListener('click', fetchReleaseNotes);

    // Search Input Event
    searchInput.addEventListener('input', renderNotes);

    // Export to CSV Button Event
    exportBtn.addEventListener('click', () => {
        const filtered = getFilteredNotes();
        if (filtered.length === 0) {
            alert('No release notes available to export.');
            return;
        }

        // CSV Header
        let csvContent = '"ID","Title","Category","Date","Plain Text","Link"\n';

        filtered.forEach(note => {
            const escapeCsv = (str) => {
                if (!str) return '""';
                return '"' + str.replace(/"/g, '""').replace(/\r?\n|\r/g, ' ') + '"';
            };

            const row = [
                escapeCsv(note.id),
                escapeCsv(note.title),
                escapeCsv(note.category),
                escapeCsv(formatDate(note.published)),
                escapeCsv(note.plain_text),
                escapeCsv(note.link)
            ].join(',');
            csvContent += row + '\n';
        });

        // Trigger client-side file download via Blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bigquery_release_notes_${currentCategory}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Tabs filter event
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderNotes();
        });
    });

    // Start App by fetching notes
    fetchReleaseNotes();
});
