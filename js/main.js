// Nabitende Secondary School — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('hamburger-btn');
    var menu = document.getElementById('mobile-menu');

    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
        var isOpen = !menu.classList.contains('hidden');
        if (isOpen) {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        } else {
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
        }
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
});

// FAQ accordion (only runs on pages that have .faq-question elements, e.g. faq.html)
document.addEventListener('DOMContentLoaded', function () {
    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(function (q) {
        var answer = document.getElementById('faq-answer-' + q.dataset.faq);
        if (!answer) return;
        answer.style.maxHeight = '0px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.25s ease';

        q.addEventListener('click', function () {
            var isOpen = q.getAttribute('aria-expanded') === 'true';

            questions.forEach(function (other) {
                other.setAttribute('aria-expanded', 'false');
                other.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
                var otherAnswer = document.getElementById('faq-answer-' + other.dataset.faq);
                if (otherAnswer) otherAnswer.style.maxHeight = '0px';
            });

            if (!isOpen) {
                q.setAttribute('aria-expanded', 'true');
                q.querySelector('.faq-icon').style.transform = 'rotate(180deg)';
                answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
            }
        });
    });
});

// Contact + admission form submission (Formspree) — submits via fetch so the
// visitor never leaves the page, and shows an inline success/error message.
document.addEventListener('DOMContentLoaded', function () {
    ['contact-form', 'admission-form', 'newsletter-form'].forEach(function (formId) {
        var form = document.getElementById(formId);
        if (!form) return;

        var status = document.getElementById(formId + '-status');
        var submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var actionUrl = form.getAttribute('action') || '';
            if (actionUrl.indexOf('YOUR_') !== -1) {
                if (status) {
                    status.textContent = 'This form is not fully set up yet \u2014 the school office needs to add a Formspree form ID. See README-forms.md.';
                    status.className = 'text-sm text-center text-amber-700';
                    status.classList.remove('hidden');
                }
                return;
            }

            var originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending\u2026';
            }

            fetch(actionUrl, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            })
                .then(function (response) {
                    if (response.ok) {
                        if (status) {
                            status.textContent = 'Thank you \u2014 your message has been sent. We\u2019ll be in touch soon.';
                            status.className = 'text-sm text-center text-emerald-700';
                            status.classList.remove('hidden');
                        }
                        form.reset();
                    } else {
                        throw new Error('Submission failed');
                    }
                })
                .catch(function () {
                    if (status) {
                        status.textContent = 'Something went wrong sending your message. Please try again, or call the school office directly.';
                        status.className = 'text-sm text-center text-red-700';
                        status.classList.remove('hidden');
                    }
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                });
        });
    });
});

// Site search — client-side lookup against a static page index, no backend needed
document.addEventListener('DOMContentLoaded', function () {
    var toggleBtn = document.getElementById('search-toggle-btn');
    var panel = document.getElementById('search-panel');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');

    if (!toggleBtn || !panel || !input || !results) return;

    var PAGES = [
        { title: 'Home', url: 'index.html', keywords: 'homepage welcome nabitende' },
        { title: 'About Us', url: 'about.html', keywords: 'history mission vision about school' },
        { title: 'Academics', url: 'academics.html', keywords: 'subjects curriculum o-level a-level sciences arts' },
        { title: 'Admissions', url: 'admissions.html', keywords: 'apply admission requirements enrol enroll join inquiry' },
        { title: 'Gallery', url: 'gallery.html', keywords: 'photos pictures campus images' },
        { title: 'News', url: 'news.html', keywords: 'news updates announcements' },
        { title: 'Contact', url: 'contact.html', keywords: 'contact phone email reach us location' },
        { title: 'Academic Calendar', url: 'calendar.html', keywords: 'calendar term dates holidays exams events' },
        { title: 'Staff Directory', url: 'staff.html', keywords: 'staff teachers headteacher leadership departments' },
        { title: 'Fees Structure', url: 'fees.html', keywords: 'fees tuition boarding day payment cost price' },
        { title: 'Frequently Asked Questions', url: 'faq.html', keywords: 'faq questions uniform boarding transport visiting' },
        { title: 'Alumni & Testimonials', url: 'alumni.html', keywords: 'alumni testimonials graduates former students' },
        { title: 'Downloads & Resources', url: 'downloads.html', keywords: 'downloads forms past papers timetable resources documents' }
    ];

    function openPanel() {
        panel.classList.remove('hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
        input.focus();
    }

    function closePanel() {
        panel.classList.add('hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        input.value = '';
        results.innerHTML = '';
    }

    toggleBtn.addEventListener('click', function () {
        var isOpen = !panel.classList.contains('hidden');
        if (isOpen) { closePanel(); } else { openPanel(); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePanel();
    });

    input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        results.innerHTML = '';
        if (!q) return;

        var matches = PAGES.filter(function (p) {
            return p.title.toLowerCase().indexOf(q) !== -1 || p.keywords.indexOf(q) !== -1;
        }).slice(0, 6);

        if (!matches.length) {
            var empty = document.createElement('p');
            empty.className = 'text-sm text-gray-500 px-4 py-3';
            empty.textContent = 'No pages matched "' + input.value.trim() + '".';
            results.appendChild(empty);
            return;
        }

        matches.forEach(function (p) {
            var a = document.createElement('a');
            a.href = p.url;
            a.className = 'block px-4 py-3 rounded-lg hover:bg-school-cream text-gray-900 font-medium transition-colors';
            a.textContent = p.title;
            results.appendChild(a);
        });
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var first = results.querySelector('a');
            if (first) window.location.href = first.getAttribute('href');
        }
    });
});