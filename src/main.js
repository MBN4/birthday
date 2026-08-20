/**
 * EmailVerify – AI Project Cost Calculator & Lead Estimator
 * Frontend Interactive Engine (Clustox UI)
 * 2-Stage Yes/No feature flow, in-place DOM updates, unlocked PDF exports, and mandatory validated phone.
 */

(function () {
    'use strict';

    const COUNTRY_CODES = [
        { code: '+92', name: 'PK (+92)' },
        { code: '+1',  name: 'US/CA (+1)' },
        { code: '+44', name: 'UK (+44)' },
        { code: '+971', name: 'UAE (+971)' },
        { code: '+966', name: 'SA (+966)' },
        { code: '+91',  name: 'IN (+91)' },
        { code: '+61',  name: 'AU (+61)' },
        { code: '+49',  name: 'DE (+49)' },
        { code: '+33',  name: 'FR (+33)' },
        { code: '+65',  name: 'SG (+65)' },
        { code: '+60',  name: 'MY (+60)' },
        { code: '+86',  name: 'CN (+86)' },
        { code: '+81',  name: 'JP (+81)' },
        { code: '+41',  name: 'CH (+41)' },
        { code: '+974', name: 'QA (+974)' },
        { code: '+968', name: 'OM (+968)' },
        { code: '+973', name: 'BH (+973)' },
        { code: '+965', name: 'KW (+965)' },
        { code: '+27',  name: 'ZA (+27)' },
        { code: '+20',  name: 'EG (+20)' },
        { code: '+234', name: 'NG (+234)' },
        { code: '+46',  name: 'SE (+46)' },
        { code: '+31',  name: 'NL (+31)' },
        { code: '+34',  name: 'ES (+34)' },
        { code: '+39',  name: 'IT (+39)' },
        { code: '+55',  name: 'BR (+55)' },
        { code: '+52',  name: 'MX (+52)' },
        { code: '+90',  name: 'TR (+90)' },
    ];

    // High-Resolution Crisp Vector Illustrations
    const SVG_EXISTING_APPS = `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="20" width="100" height="160" rx="16" fill="#EFF6FF" stroke="#3B82F6" stroke-width="4"/>
        <rect x="62" y="38" width="76" height="32" rx="6" fill="#DBEAFE"/>
        <rect x="62" y="78" width="76" height="14" rx="4" fill="#93C5FD"/>
        <rect x="62" y="98" width="76" height="14" rx="4" fill="#BFDBFE"/>
        <circle cx="80" cy="136" r="12" fill="#3B82F6"/>
        <circle cx="120" cy="136" r="12" fill="#93C5FD"/>
        <circle cx="160" cy="90" r="14" fill="#F97316"/>
        <path d="M142 140 C142 118 178 118 178 140 Z" fill="#1E40AF"/>
        <line x1="140" y1="40" x2="165" y2="70" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    </svg>`;

    const SVG_OWN_BUSINESS = `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="55" y="25" width="95" height="155" rx="16" fill="#F8FAFC" stroke="#64748B" stroke-width="4"/>
        <circle cx="102.5" cy="50" r="14" fill="#CBD5E1"/>
        <rect x="70" y="75" width="65" height="10" rx="3" fill="#E2E8F0"/>
        <rect x="70" y="95" width="65" height="10" rx="3" fill="#E2E8F0"/>
        <rect x="70" y="115" width="40" height="8" rx="3" fill="#3B82F6"/>
        <circle cx="120" cy="119" r="6" fill="#10B981"/>
        <circle cx="45" cy="85" r="14" fill="#3B82F6"/>
        <path d="M28 135 C28 112 62 112 62 135 Z" fill="#0F172A"/>
        <circle cx="45" cy="148" r="4" fill="#0F172A"/>
    </svg>`;

    function initCalculatorInstance(container) {
        const calcId = container.getAttribute('data-calc-id');
        const rootApp = container.querySelector('.aics-root-app');
        if (!calcId || !rootApp) return;

        let calcData = null;
        let prevPrice = 0;
        let prevHours = 0;

        // State Store
        const state = {
            step: 'landing', // 'landing' | 'sub_select' | 'config' | 'final' | 'success'
            stepIndex: 0,
            featureSubStage: 'decision', // 'decision' | 'details'
            direction: 'forward',
            mode: 'existing',
            category: null,
            platform: null,
            design: 'custom',
            features: {},
            quoteMethod: 'email', // 'email' | 'pdf'
            selectedCountryCode: '+92',
        };

        // Fetch Calculator Configuration
        fetch(`${aicsConfig.rest}calc/${calcId}`)
            .then(res => {
                if (!res.ok) throw new Error('Calculator data could not be loaded.');
                return res.json();
            })
            .then(data => {
                calcData = data;
                render();
                trackInteraction();
            })
            .catch(err => {
                rootApp.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444;font-weight:700;">${err.message || 'Error loading calculator.'}</div>`;
            });

        function trackInteraction() {
            fetch(`${aicsConfig.rest}interact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': aicsConfig.nonce },
                body: JSON.stringify({ calc_id: calcId })
            }).catch(() => {});
        }

        // Calculation Engine
        function calculateEstimates() {
            let baseHours = 0;
            let basePrice = 0;

            if (state.platform) {
                basePrice += (parseFloat(state.platform.price) || 0);
            }

            Object.values(state.features).forEach(f => {
                if (f.active) {
                    baseHours += (parseFloat(f.baseTime) || 0);
                    basePrice += (parseFloat(f.price) || 0);

                    if (f.selectedSubs && Array.isArray(f.selectedSubs)) {
                        f.selectedSubs.forEach(sf => {
                            baseHours += (parseFloat(sf.time) || 0);
                            basePrice += (parseFloat(sf.price) || 0);
                        });
                    }
                }
            });

            let designHours = 0;
            let designPrice = 0;
            if (state.design === 'custom') {
                designHours = Math.round(baseHours * 0.25);
                designPrice = Math.round(basePrice * 0.25);
            } else if (state.design === 'luxury') {
                designHours = Math.round(baseHours * 0.5);
                designPrice = Math.round(basePrice * 0.5);
            }

            const totalHours = Math.max(16, baseHours + designHours);
            const totalPrice = Math.max(650, basePrice + designPrice);

            const devHours = Math.round(totalHours * 0.77);
            const nonDevHours = totalHours - devHours;
            const weeks = Math.max(1, Math.ceil(totalHours / 25));

            const minPrice = Math.round(totalPrice * 0.9);
            const maxPrice = Math.round(totalPrice * 1.15);

            return {
                hours: totalHours,
                devHours: devHours,
                nonDevHours: nonDevHours,
                price: totalPrice,
                weeks: weeks,
                formattedPrice: `$${minPrice.toLocaleString()} – $${maxPrice.toLocaleString()}`,
                formattedTime: `${totalHours} Total Hours (~${weeks} ${weeks === 1 ? 'wk' : 'wks'})`,
                releaseDate: getEstimatedReleaseDate(weeks)
            };
        }

        function getEstimatedReleaseDate(weeks) {
            const date = new Date();
            date.setDate(date.getDate() + (weeks * 7));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        // Live Sidebar Bump & Pulse Animation
        function updateSummaryCounters(est) {
            const sumTimeVal = container.querySelector('.aics-stat-summary-time .stat-val');
            const sumCard = container.querySelector('.aics-stat-summary-time');
            const devTimeVal = container.querySelector('.aics-stat-dev-time .stat-val');
            const nonDevTimeVal = container.querySelector('.aics-stat-nondev-time .stat-val');

            if (!sumTimeVal) return;

            if (est.hours !== prevHours) {
                sumTimeVal.classList.remove('aics-val-bump');
                sumCard.classList.remove('aics-card-pulse');
                void sumTimeVal.offsetWidth;
                sumTimeVal.classList.add('aics-val-bump');
                sumCard.classList.add('aics-card-pulse');
            }

            sumTimeVal.innerHTML = `${est.hours} <small>h</small>`;
            if (devTimeVal) devTimeVal.innerHTML = `${est.devHours} <small>h</small>`;
            if (nonDevTimeVal) nonDevTimeVal.innerHTML = `${est.nonDevHours} <small>h</small>`;

            prevHours = est.hours;
            prevPrice = est.price;
        }

        // FAQ Accordions Builder
        function getFaqsHtml(screenKey) {
            if (!calcData.faqs || !Array.isArray(calcData.faqs)) return '';
            const screenFaqs = calcData.faqs.filter(f => f.screen === screenKey);
            if (screenFaqs.length === 0) return '';

            const faqsItems = screenFaqs.map((faq, i) => `
                <div class="aics-faq-item">
                    <button type="button" class="aics-faq-q" data-faq-index="${i}">
                        <span>${faq.question}</span>
                        <span class="aics-faq-toggle-icon">+</span>
                    </button>
                    <div class="aics-faq-a-wrap">
                        <div class="aics-faq-a">${faq.answer}</div>
                    </div>
                </div>
            `).join('');

            return `
                <div class="aics-faq-section">
                    <h4 class="aics-faq-heading">Frequently Asked Questions</h4>
                    <div class="aics-faq-list">${faqsItems}</div>
                </div>
            `;
        }

        // -------------------------------------------------------------
        // VIEW 1: LANDING SCREEN
        // -------------------------------------------------------------
        function renderLanding() {
            const config = calcData.config || {};
            const existingTpls = config.existing || [];
            const customCats = config.custom || [];

            const heroHeadline = config.hero_headline || `Get a Quick Cost Estimate for ${calcData.title}`;
            const heroSubheading = config.hero_subheading || 'Use this calculator to get a clear estimate based on your selected features, platform, and complexity. It helps you understand what to expect before you begin development.';

            let formattedHeading = heroHeadline;
            if (heroHeadline.toLowerCase().includes('get a quick cost estimate for')) {
                const parts = heroHeadline.split(/(Get a Quick Cost Estimate for)/i);
                formattedHeading = `${parts[1] || 'Get a Quick Cost Estimate for'} <span>${parts[2] || calcData.title}</span>`;
            } else {
                formattedHeading = `<span>${heroHeadline}</span>`;
            }

            const existingPreview = existingTpls.slice(0, 4).map(t => t.name.replace(/(-like|\sStore|\sApp|\sWorkspace|\sPortal).*/i, '')).join(', ') + ' etc.';
            const customPreview = customCats.slice(0, 4).map(c => c.name.replace(/(\sWebsite|\sMobile|\sApp|\sPortal).*/i, '')).join(', ') + ' etc.';

            return `
                <div class="aics-view ${state.direction === 'back' ? 'dir-back' : ''}">
                    <div class="aics-landing-header">
                        <h1 class="aics-landing-title">${formattedHeading}</h1>
                        <p class="aics-landing-sub">${heroSubheading}</p>
                    </div>

                    <div class="aics-master-split-grid">
                        <div class="aics-master-card" data-master-type="existing">
                            <div class="aics-master-card-content">
                                <h3 class="aics-master-card-title">Like Existing Products</h3>
                                <p class="aics-master-card-desc">${existingPreview}</p>
                                <button type="button" class="aics-btn-primary">Continue</button>
                            </div>
                            <div class="aics-card-illustration">${SVG_EXISTING_APPS}</div>
                        </div>

                        <div class="aics-master-card" data-master-type="custom">
                            <div class="aics-master-card-content">
                                <h3 class="aics-master-card-title">For My Own Business</h3>
                                <p class="aics-master-card-desc">${customPreview}</p>
                                <button type="button" class="aics-btn-primary">Continue</button>
                            </div>
                            <div class="aics-card-illustration">${SVG_OWN_BUSINESS}</div>
                        </div>
                    </div>

                    ${getFaqsHtml('landing')}
                </div>
            `;
        }

        // Sub-selector for picking specific model
        function renderSubSelector() {
            const config = calcData.config || {};
            const items = (state.mode === 'existing') ? (config.existing || []) : (config.custom || []);

            const itemsHtml = items.map(item => `
                <div class="aics-model-item" data-item-id="${item.id}">
                    <span class="aics-model-item-title">${item.name}</span>
                    <span class="aics-model-item-sub">${item.subName || (state.mode === 'existing' ? 'Pre-configured architecture' : 'Built from scratch')}</span>
                </div>
            `).join('');

            return `
                <div class="aics-view ${state.direction === 'back' ? 'dir-back' : ''}">
                    <button type="button" class="aics-back-pill" id="aics-back-to-master" style="margin-bottom:1rem;">
                        &larr; Back
                    </button>

                    <div class="aics-sub-grid-container">
                        <h2 style="font-size:1.35rem;font-weight:800;margin:0 0 0.4rem;color:#0f172a;">
                            ${state.mode === 'existing' ? 'Select a Starting Baseline Model' : 'Choose Your Business Category'}
                        </h2>
                        <p style="color:#64748b;font-size:0.88rem;margin:0 0 1.25rem;">
                            Pick the closest match to configure individual features and calculate your sprint timeline.
                        </p>
                        <div class="aics-models-grid">${itemsHtml}</div>
                    </div>
                </div>
            `;
        }

        // Steps sequence generator
        function getConfigSteps() {
            const steps = [];
            const config = calcData.config || {};

            if (config.platforms && config.platforms.length > 0) {
                steps.push({ type: 'platform', title: 'Target Platform' });
            }

            let activeFeatures = [];
            if (state.mode === 'existing' && state.category && state.category.features) {
                activeFeatures = state.category.features;
            } else if (config.features) {
                activeFeatures = config.features;
            }

            activeFeatures.forEach(f => {
                steps.push({ type: 'feature', data: f, title: f.name });
            });

            steps.push({ type: 'design', title: 'Design & UI/UX Tier' });

            return steps;
        }

        // -------------------------------------------------------------
        // VIEW 2: CONFIGURATOR (2-STAGE YES/NO -> NEXT SCREEN MVP)
        // -------------------------------------------------------------
        function renderConfig() {
            const steps = getConfigSteps();
            const currentStep = steps[state.stepIndex] || steps[0];
            const progress = Math.round(((state.stepIndex + 1) / steps.length) * 100);
            const est = calculateEstimates();
            const categoryName = state.category ? state.category.name : 'Project';

            let mainContentHtml = '';

            // 1. Platform Step
            if (currentStep.type === 'platform') {
                const platforms = calcData.config.platforms || [];
                const rows = platforms.map(p => {
                    const isSelected = state.platform && state.platform.id === p.id;
                    return `
                        <div class="aics-model-item aics-platform-card ${isSelected ? 'active' : ''}" data-plat-id="${p.id}" style="margin-bottom:10px;">
                            <span class="aics-model-item-title">${p.label}</span>
                            <span class="aics-model-item-sub" style="font-weight:700;color:#059669;">
                                ${parseFloat(p.price) > 0 ? '+$' + p.price : 'Standard Included'}
                            </span>
                        </div>
                    `;
                }).join('');

                mainContentHtml = `
                    <h3 class="aics-feature-q-title">Select Target Platform</h3>
                    <p class="aics-feature-q-sub">Choose deployment architecture for your application.</p>
                    <div style="margin-bottom:1.5rem;" id="aics-platform-list-wrap">${rows}</div>
                    <button type="button" class="aics-btn-primary aics-step-next" id="aics-save-platform-btn">Save and continue</button>
                `;
            }

            // 2. Feature Step (2-Stage Flow: Stage 1 = Yes/No, Stage 2 = MVP Checklists)
            else if (currentStep.type === 'feature') {
                const f = currentStep.data;
                const fState = state.features[f.id] || { active: true, selectedSubs: [] };

                if (state.featureSubStage === 'decision') {
                    mainContentHtml = `
                        <h3 class="aics-feature-q-title">${f.name}</h3>
                        <p class="aics-feature-q-sub">${f.description || 'Handles standard core functional logic.'}</p>

                        <div class="aics-decision-pair">
                            <div class="aics-decision-card aics-trigger-yes" data-feat-id="${f.id}">
                                <span class="d-main">Yes</span>
                                <span class="d-time">+${f.baseTime || 12}h</span>
                            </div>
                            <div class="aics-decision-card aics-trigger-no" data-feat-id="${f.id}">
                                <span class="d-main">No</span>
                                <span class="d-time">0h</span>
                            </div>
                        </div>
                        <small style="color:#64748b;font-size:0.8rem;display:block;">Click <strong>Yes</strong> to configure detailed sub-options, or <strong>No</strong> to skip.</small>
                    `;
                } else {
                    const mvpSubs = (f.subFeatures || []).filter(s => s.type === 'enough');
                    const addSubs = (f.subFeatures || []).filter(s => s.type !== 'enough');

                    const renderSubList = (list) => list.map(sf => {
                        const isChecked = fState.selectedSubs && fState.selectedSubs.some(s => s.id === sf.id);
                        return `
                            <label class="aics-check-row">
                                <input type="checkbox" class="aics-sub-checkbox" data-feat-id="${f.id}" data-sub-id="${sf.id}" ${isChecked ? 'checked' : ''}>
                                <span class="aics-check-row-label">${sf.name}</span>
                                <span class="aics-check-row-badge">+${sf.time || 4} hours</span>
                            </label>
                        `;
                    }).join('');

                    mainContentHtml = `
                        <h3 class="aics-feature-q-title">Do You Need ${f.name}?</h3>
                        <p class="aics-feature-q-sub">Please choose required features below:</p>

                        <div class="aics-mvp-columns">
                            <div>
                                <span class="aics-column-title">Enough for MVP</span>
                                ${renderSubList(mvpSubs.length ? mvpSubs : f.subFeatures.slice(0, 2))}
                            </div>
                            <div>
                                <span class="aics-column-title">Additional features</span>
                                ${renderSubList(addSubs.length ? addSubs : f.subFeatures.slice(2))}
                            </div>
                        </div>

                        <div style="margin-top:2rem;text-align:right;">
                            <button type="button" class="aics-btn-primary aics-step-next">Save and continue</button>
                        </div>
                    `;
                }
            }

            // 3. Design Tier Step
            else if (currentStep.type === 'design') {
                mainContentHtml = `
                    <h3 class="aics-feature-q-title">Select Design &amp; UI/UX Tier</h3>
                    <p class="aics-feature-q-sub">Choose the design depth and prototyping requirements.</p>

                    <div style="display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1.5rem;" id="aics-design-list-wrap">
                        <div class="aics-decision-card aics-design-card ${state.design === 'standard' ? 'active' : ''}" data-design-val="standard" style="text-align:left;padding:1.2rem;">
                            <span class="d-main">Standard Clean UI</span>
                            <span class="d-time" style="margin-top:4px;">Component library design system, clean responsive layouts. (Baseline)</span>
                        </div>
                        <div class="aics-decision-card aics-design-card ${state.design === 'custom' ? 'active' : ''}" data-design-val="custom" style="text-align:left;padding:1.2rem;">
                            <span class="d-main">Bespoke Custom Brand Prototyping</span>
                            <span class="d-time" style="margin-top:4px;">100% tailor-made Figma prototypes, micro-interactions, brand guide. (+25% scope)</span>
                        </div>
                        <div class="aics-decision-card aics-design-card ${state.design === 'luxury' ? 'active' : ''}" data-design-val="luxury" style="text-align:left;padding:1.2rem;">
                            <span class="d-main">Enterprise / High-Conversion UI</span>
                            <span class="d-time" style="margin-top:4px;">Custom motion design, interactive micro-states, UX conversion audit. (+50% scope)</span>
                        </div>
                    </div>

                    <div style="text-align:right;">
                        <button type="button" class="aics-btn-primary aics-finish-config">Generate Project Estimate &rarr;</button>
                    </div>
                `;
            }

            return `
                <div class="aics-view ${state.direction === 'back' ? 'dir-back' : ''}">
                    <div class="aics-config-header">
                        <div class="aics-config-header-left">
                            <button type="button" class="aics-back-pill" id="aics-btn-back">
                                &larr; Back
                            </button>
                            <h2 class="aics-config-heading">
                                Configuring Features For <span>${categoryName}?</span>
                            </h2>
                        </div>
                        <span class="aics-step-pill">Step ${state.stepIndex + 1} of ${steps.length}</span>
                    </div>

                    <div class="aics-slim-progress">
                        <div class="aics-slim-progress-fill" style="width: ${progress}%;"></div>
                    </div>

                    <div class="aics-workspace-layout">
                        <div class="aics-workspace-main">
                            <div class="aics-feature-card">${mainContentHtml}</div>
                        </div>

                        <div class="aics-workspace-sidebar">
                            <div class="aics-sidebar-stack">
                                <div class="aics-stat-card blue-card aics-stat-summary-time">
                                    <span class="stat-label">Summary time</span>
                                    <span class="stat-val">${est.hours} <small>h</small></span>
                                </div>
                                <div class="aics-stat-card light-card aics-stat-dev-time">
                                    <span class="stat-label">Development time</span>
                                    <span class="stat-val">${est.devHours} <small>h</small></span>
                                </div>
                                <div class="aics-stat-card light-card aics-stat-nondev-time">
                                    <span class="stat-label">Non-dev time</span>
                                    <span class="stat-val">${est.nonDevHours} <small>h</small></span>
                                </div>
                                <div class="aics-sidebar-note">
                                    It's the time required to implement given functionality. It includes time for business logic, UI (User Interface) and unit testing.
                                </div>
                            </div>
                        </div>
                    </div>

                    ${getFaqsHtml('config')}
                </div>
            `;
        }

        // -------------------------------------------------------------
        // VIEW 3: FINAL ESTIMATE SCREEN (SPACIOUS METRICS & LEAD CAPTURE)
        // -------------------------------------------------------------
        function renderFinal() {
            const est = calculateEstimates();

            const countryOptions = COUNTRY_CODES.map(c => `
                <option value="${c.code}" ${state.selectedCountryCode === c.code ? 'selected' : ''}>${c.name}</option>
            `).join('');

            return `
                <div class="aics-view ${state.direction === 'back' ? 'dir-back' : ''}">
                    <button type="button" class="aics-back-pill" id="aics-btn-back-final" style="margin-bottom:1.5rem;">
                        &larr; Adjust Specifications
                    </button>

                    <div class="aics-final-grid">
                        <div class="aics-final-summary-pane">
                            <div>
                                <h2>Your Project Estimate</h2>
                                <div class="pane-sub">${calcData.title} &bull; ${state.category ? state.category.name : 'Custom Scope'}</div>

                                <div class="aics-final-total-box">
                                    <div class="lbl">Estimated Budget Range</div>
                                    <div class="val-price">${est.formattedPrice}</div>
                                </div>

                                <div class="aics-spacious-metrics-grid">
                                    <div class="aics-metric-card">
                                        <div class="m-lbl">Estimated Timeline</div>
                                        <div class="m-val">${est.hours} Total Hours <small>(~${est.weeks} ${est.weeks === 1 ? 'wk' : 'wks'})</small></div>
                                    </div>
                                    <div class="aics-metric-card">
                                        <div class="m-lbl">Est. Delivery Target</div>
                                        <div class="m-val">${est.releaseDate} <small>Sprint Velocity</small></div>
                                    </div>
                                </div>

                                <div class="aics-pro-promo-box">
                                    <div class="aics-pro-promo-icon">⚡</div>
                                    <div class="aics-pro-promo-text">
                                        <strong>Full SOW &amp; Milestones Included</strong>
                                        <span>Itemized feature breakdown, tech stack proposal &amp; sprint roadmap.</span>
                                    </div>
                                </div>
                            </div>

                            <div style="padding-top:1rem;border-top:1px solid rgba(255,255,255,0.12);font-size:0.75rem;color:#94a3b8;">
                                Based on agile velocity of 25-30 hours per sprint.
                            </div>
                        </div>

                        <div class="aics-final-form-pane">
                            <h3>Receive Your Detailed Scope</h3>
                            <p class="form-sub">Enter your details to receive an itemized breakdown, tech stack proposal, and roadmap.</p>

                            <div class="aics-delivery-methods">
                                <div class="aics-method-card ${state.quoteMethod === 'email' ? 'active' : ''}" data-method="email">
                                    <span class="m-title">📧 Send to Email</span>
                                    <span class="m-sub">Instant Inbox Dispatch</span>
                                </div>
                                <div class="aics-method-card ${state.quoteMethod === 'pdf' ? 'active' : ''}" data-method="pdf">
                                    <span class="m-title">📄 Download PDF</span>
                                    <span class="m-sub">Branded Scope Document</span>
                                </div>
                            </div>

                            <form id="aics-lead-form">
                                <div class="aics-field-group">
                                    <label>Your Name *</label>
                                    <input type="text" name="name" required placeholder="John Doe">
                                </div>
                                <div class="aics-field-group">
                                    <label>Email Address *</label>
                                    <input type="email" name="email" required placeholder="john@example.com">
                                </div>

                                <div class="aics-field-group">
                                    <label>Phone / WhatsApp *</label>
                                    <div class="aics-phone-input-row">
                                        <select id="aics-country-code-select" aria-label="Country Code">
                                            ${countryOptions}
                                        </select>
                                        <input type="tel" name="phone" id="aics-phone-input" required placeholder="3001234567" maxlength="11" autocomplete="tel">
                                    </div>
                                    <small style="color:#64748b;font-size:0.72rem;margin-top:4px;display:block;">Only 11 numerical digits (e.g. 3001234567 for PK numbers).</small>
                                </div>

                                <div style="margin-top:1.5rem;">
                                    <button type="submit" class="aics-btn-primary aics-btn-block" id="aics-submit-lead-btn">
                                        ${state.quoteMethod === 'pdf' ? '📄 Download Official PDF Scope' : 'Send Me Full Scope &amp; Quote'}
                                    </button>
                                </div>
                                <div style="font-size:0.72rem;color:#64748b;text-align:center;margin-top:0.75rem;">
                                    🔒 100% confidential. No spam guaranteed.
                                </div>
                            </form>
                        </div>
                    </div>

                    ${getFaqsHtml('final')}
                </div>
            `;
        }

        // VIEW 4: SUCCESS SCREEN
        function renderSuccess() {
            return `
                <div class="aics-view">
                    <div class="aics-success-card">
                        <div style="font-size:3.5rem;margin-bottom:1rem;">🎉</div>
                        <h2>Estimation Dispatched Successfully!</h2>
                        <p>Thank you. Your detailed scope breakdown and technical sprint timeline have been logged. Our engineering lead will review your specifications shortly.</p>
                        <button type="button" class="aics-btn-primary" id="aics-restart-btn">Calculate Another Project</button>
                    </div>
                </div>
            `;
        }

        // PDF Generation
        function generatePdfDocument() {
            const est = calculateEstimates();
            const siteName = aicsConfig.site_name || 'Project Estimator';
            const categoryName = state.category ? state.category.name : 'Custom Scope';

            const featuresHtml = Object.values(state.features)
                .filter(f => f.active)
                .map(f => {
                    const subs = (f.selectedSubs || []).map(s => `<li>${s.name}</li>`).join('');
                    return `<div style="margin-bottom:8px;"><strong>${f.name}</strong>${subs ? `<ul style="margin:4px 0 0 16px;color:#555;">${subs}</ul>` : ''}</div>`;
                }).join('');

            const faqsHtml = (calcData.faqs || []).map(f => `
                <div style="margin-bottom:10px;">
                    <div style="font-weight:bold;color:#0f172a;">Q: ${f.question}</div>
                    <div style="color:#475569;font-size:12px;margin-top:2px;">A: ${f.answer}</div>
                </div>
            `).join('');

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${categoryName} - Technical Scope Estimate</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
                        .header { border-bottom: 2px solid #0052fe; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .title { font-size: 24px; font-weight: 800; color: #0f172a; }
                        .badge { background: #eff6ff; color: #0052fe; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                        .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
                        .stat-val { font-size: 20px; font-weight: 800; color: #059669; margin-top: 4px; }
                        .section-title { font-size: 16px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 25px 0 15px; color: #1e3a8a; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="title">${categoryName}</div>
                            <div style="color:#64748b;margin-top:4px;">Technical Scope &amp; Estimation Document</div>
                        </div>
                        <div class="badge">${siteName}</div>
                    </div>

                    <div class="stat-box">
                        <div><small style="color:#64748b;">ESTIMATED BUDGET</small><div class="stat-val">${est.formattedPrice}</div></div>
                        <div><small style="color:#64748b;">TIMELINE</small><div class="stat-val" style="color:#0052fe;">${est.hours} Total Hours</div></div>
                        <div><small style="color:#64748b;">TARGET RELEASE</small><div class="stat-val" style="color:#0f172a;font-size:16px;">${est.releaseDate}</div></div>
                    </div>

                    <div class="section-title">Included Scope &amp; Functional Modules</div>
                    <div>${featuresHtml}</div>

                    ${faqsHtml ? `<div class="section-title">Frequently Asked Questions &amp; Guidelines</div><div>${faqsHtml}</div>` : ''}

                    <div style="margin-top:40px;padding-top:15px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px;text-align:center;">
                        Generated by ${siteName} Interactive Scoping Engine on ${new Date().toLocaleDateString()}.
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 250);
        }

        // Master Render Controller
        function render() {
            if (!calcData) return;

            if (state.step === 'landing') {
                rootApp.innerHTML = renderLanding();
            } else if (state.step === 'sub_select') {
                rootApp.innerHTML = renderSubSelector();
            } else if (state.step === 'config') {
                rootApp.innerHTML = renderConfig();
            } else if (state.step === 'final') {
                rootApp.innerHTML = renderFinal();
            } else if (state.step === 'success') {
                rootApp.innerHTML = renderSuccess();
            }

            attachEvents();
        }

        // Event Handling
        function attachEvents() {
            // Master Choice Cards
            rootApp.querySelectorAll('.aics-master-card').forEach(card => {
                card.addEventListener('click', function () {
                    const type = this.getAttribute('data-master-type');
                    state.mode = type;
                    state.direction = 'forward';
                    state.step = 'sub_select';
                    render();
                });
            });

            // Back to Master Cards
            const btnBackMaster = rootApp.querySelector('#aics-back-to-master');
            if (btnBackMaster) {
                btnBackMaster.addEventListener('click', function () {
                    state.direction = 'back';
                    state.step = 'landing';
                    render();
                });
            }

            // Model Selection
            rootApp.querySelectorAll('.aics-model-item[data-item-id]').forEach(item => {
                item.addEventListener('click', function () {
                    const itemId = this.getAttribute('data-item-id');
                    if (!itemId) return;

                    state.direction = 'forward';
                    const config = calcData.config || {};

                    if (state.mode === 'existing') {
                        const tpl = (config.existing || []).find(t => t.id === itemId);
                        state.category = tpl;

                        state.features = {};
                        (tpl.features || []).forEach(f => {
                            state.features[f.id] = {
                                name: f.name,
                                baseTime: f.baseTime,
                                price: f.price,
                                active: true,
                                selectedSubs: (f.subFeatures || []).filter(s => s.type === 'enough')
                            };
                        });
                    } else {
                        const cat = (config.custom || []).find(c => c.id === itemId);
                        state.category = cat;

                        state.features = {};
                        (config.features || []).forEach(f => {
                            state.features[f.id] = {
                                name: f.name,
                                baseTime: f.baseTime,
                                price: f.price,
                                active: true,
                                selectedSubs: (f.subFeatures || []).filter(s => s.type === 'enough')
                            };
                        });
                    }

                    if (config.platforms && config.platforms.length > 0) {
                        state.platform = config.platforms[0];
                    }

                    state.step = 'config';
                    state.stepIndex = 0;
                    state.featureSubStage = 'decision';
                    render();
                });
            });

            // Back button in Configurator
            const btnBack = rootApp.querySelector('#aics-btn-back');
            if (btnBack) {
                btnBack.addEventListener('click', function () {
                    state.direction = 'back';
                    const steps = getConfigSteps();
                    const currentStep = steps[state.stepIndex];

                    if (currentStep && currentStep.type === 'feature' && state.featureSubStage === 'details') {
                        state.featureSubStage = 'decision';
                        render();
                        return;
                    }

                    if (state.stepIndex > 0) {
                        state.stepIndex--;
                        state.featureSubStage = 'decision';
                        render();
                    } else {
                        state.step = 'sub_select';
                        render();
                    }
                });
            }

            // Back button in Final Screen
            const btnBackFinal = rootApp.querySelector('#aics-btn-back-final');
            if (btnBackFinal) {
                btnBackFinal.addEventListener('click', function () {
                    state.direction = 'back';
                    state.step = 'config';
                    const steps = getConfigSteps();
                    state.stepIndex = steps.length - 1;
                    state.featureSubStage = 'decision';
                    render();
                });
            }

            // Platform Selection
            rootApp.querySelectorAll('.aics-platform-card').forEach(card => {
                card.addEventListener('click', function () {
                    const platId = this.getAttribute('data-plat-id');
                    const plat = (calcData.config.platforms || []).find(p => p.id === platId);
                    if (plat) {
                        state.platform = plat;

                        rootApp.querySelectorAll('.aics-platform-card').forEach(c => c.classList.remove('active'));
                        this.classList.add('active');

                        const est = calculateEstimates();
                        updateSummaryCounters(est);

                        const saveBtn = rootApp.querySelector('#aics-save-platform-btn');
                        if (saveBtn) saveBtn.disabled = false;
                    }
                });
            });

            // Platform Save & Continue
            const savePlatBtn = rootApp.querySelector('#aics-save-platform-btn');
            if (savePlatBtn) {
                savePlatBtn.addEventListener('click', function () {
                    const steps = getConfigSteps();
                    if (state.stepIndex < steps.length - 1) {
                        state.direction = 'forward';
                        state.stepIndex++;
                        state.featureSubStage = 'decision';
                        render();
                    }
                });
            }

            // Feature Stage 1: Yes Click -> Sub-Screen
            const yesBtn = rootApp.querySelector('.aics-trigger-yes');
            if (yesBtn) {
                yesBtn.addEventListener('click', function () {
                    const fId = this.getAttribute('data-feat-id');
                    if (state.features[fId]) {
                        state.features[fId].active = true;
                    }
                    state.direction = 'forward';
                    state.featureSubStage = 'details';
                    render();
                });
            }

            // Feature Stage 1: No Click -> Skip to Next Feature
            const noBtn = rootApp.querySelector('.aics-trigger-no');
            if (noBtn) {
                noBtn.addEventListener('click', function () {
                    const fId = this.getAttribute('data-feat-id');
                    if (state.features[fId]) {
                        state.features[fId].active = false;
                    }
                    const est = calculateEstimates();
                    updateSummaryCounters(est);

                    const steps = getConfigSteps();
                    if (state.stepIndex < steps.length - 1) {
                        state.direction = 'forward';
                        state.stepIndex++;
                        state.featureSubStage = 'decision';
                        render();
                    }
                });
            }

            // Sub-feature Checkboxes
            rootApp.querySelectorAll('.aics-sub-checkbox').forEach(cb => {
                cb.addEventListener('change', function () {
                    const fId = this.getAttribute('data-feat-id');
                    const sfId = this.getAttribute('data-sub-id');
                    if (!state.features[fId]) return;

                    let steps = getConfigSteps();
                    let fObj = steps.find(s => s.type === 'feature' && s.data.id === fId);
                    if (!fObj) return;

                    let subObj = (fObj.data.subFeatures || []).find(s => s.id === sfId);
                    if (!subObj) return;

                    if (!state.features[fId].selectedSubs) state.features[fId].selectedSubs = [];

                    if (this.checked) {
                        if (!state.features[fId].selectedSubs.some(s => s.id === sfId)) {
                            state.features[fId].selectedSubs.push(subObj);
                        }
                    } else {
                        state.features[fId].selectedSubs = state.features[fId].selectedSubs.filter(s => s.id !== sfId);
                    }

                    const est = calculateEstimates();
                    updateSummaryCounters(est);
                });
            });

            // Design Tier Selection
            rootApp.querySelectorAll('.aics-design-card').forEach(card => {
                card.addEventListener('click', function () {
                    const designVal = this.getAttribute('data-design-val');
                    if (designVal) {
                        state.design = designVal;
                        rootApp.querySelectorAll('.aics-design-card').forEach(c => c.classList.remove('active'));
                        this.classList.add('active');

                        const est = calculateEstimates();
                        updateSummaryCounters(est);
                    }
                });
            });

            // Feature Save & Continue Button
            const nextBtn = rootApp.querySelector('.aics-step-next');
            if (nextBtn && !savePlatBtn) {
                nextBtn.addEventListener('click', function () {
                    const steps = getConfigSteps();
                    if (state.stepIndex < steps.length - 1) {
                        state.direction = 'forward';
                        state.stepIndex++;
                        state.featureSubStage = 'decision';
                        render();
                    }
                });
            }

            // Finish Config Button -> Final Step
            const finishBtn = rootApp.querySelector('.aics-finish-config');
            if (finishBtn) {
                finishBtn.addEventListener('click', function () {
                    state.direction = 'forward';
                    state.step = 'final';
                    render();
                });
            }

            // Delivery Method Selector (Email vs PDF)
            rootApp.querySelectorAll('.aics-method-card').forEach(card => {
                card.addEventListener('click', function () {
                    const method = this.getAttribute('data-method');
                    state.quoteMethod = method;
                    rootApp.querySelectorAll('.aics-method-card').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');

                    const submitBtn = rootApp.querySelector('#aics-submit-lead-btn');
                    if (submitBtn) {
                        submitBtn.innerHTML = (method === 'pdf')
                            ? '📄 Download Official PDF Scope'
                            : 'Send Me Full Scope &amp; Quote';
                    }
                });
            });

            // Country Code Select
            const countrySelect = rootApp.querySelector('#aics-country-code-select');
            if (countrySelect) {
                countrySelect.addEventListener('change', function () {
                    state.selectedCountryCode = this.value;
                });
            }

            // Strict Phone Number Digit Sanitization & 11-digit Limit
            const phoneInput = rootApp.querySelector('#aics-phone-input');
            if (phoneInput) {
                phoneInput.addEventListener('input', function () {
                    this.value = this.value.replace(/\D/g, '');
                    if (this.value.length > 11) {
                        this.value = this.value.slice(0, 11);
                    }
                });
            }

            // Lead Form Submission
            const leadForm = rootApp.querySelector('#aics-lead-form');
            if (leadForm) {
                leadForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const submitBtn = rootApp.querySelector('#aics-submit-lead-btn');

                    const formData = new FormData(leadForm);
                    const rawPhone = (formData.get('phone') || '').trim().replace(/\D/g, '');

                    if (!rawPhone || rawPhone.length < 7) {
                        alert('Please enter a valid phone number (7 to 11 digits).');
                        return;
                    }

                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Processing & Submitting...';

                    const est = calculateEstimates();
                    const formattedPhone = `${state.selectedCountryCode} ${rawPhone}`;

                    const featuresText = Object.values(state.features)
                        .filter(f => f.active)
                        .map(f => {
                            const subs = (f.selectedSubs || []).map(s => s.name).join(', ');
                            return `• ${f.name}${subs ? ` (${subs})` : ''}`;
                        }).join("\n");

                    const payload = {
                        calc_id: calcId,
                        calc_title: calcData.title,
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formattedPhone,
                        niche: calcData.niche_key,
                        category: state.category ? state.category.name : 'Custom',
                        platform: state.platform ? state.platform.label : 'Default',
                        design: state.design,
                        features_text: featuresText,
                        summary_time: est.formattedTime,
                        summary_price: est.formattedPrice,
                        release_date: est.releaseDate,
                        page_url: window.location.href,
                        send_email: (state.quoteMethod === 'email'),
                    };

                    fetch(`${aicsConfig.rest}lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': aicsConfig.nonce },
                        body: JSON.stringify(payload)
                    })
                    .then(res => res.json())
                    .then(() => {
                        if (state.quoteMethod === 'pdf') {
                            generatePdfDocument();
                        }
                        state.step = 'success';
                        render();
                    })
                    .catch(() => {
                        if (state.quoteMethod === 'pdf') {
                            generatePdfDocument();
                        }
                        state.step = 'success';
                        render();
                    });
                });
            }

            // Restart Button
            const restartBtn = rootApp.querySelector('#aics-restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', function () {
                    state.step = 'landing';
                    state.stepIndex = 0;
                    state.featureSubStage = 'decision';
                    state.category = null;
                    state.platform = null;
                    state.features = {};
                    state.quoteMethod = 'email';
                    render();
                });
            }

            // FAQ Accordions
            rootApp.querySelectorAll('.aics-faq-q').forEach(qBtn => {
                qBtn.addEventListener('click', function () {
                    const item = this.closest('.aics-faq-item');
                    const wrap = item.querySelector('.aics-faq-a-wrap');
                    const isOpen = item.classList.contains('open');

                    if (isOpen) {
                        item.classList.remove('open');
                        wrap.style.maxHeight = null;
                    } else {
                        item.classList.add('open');
                        wrap.style.maxHeight = wrap.scrollHeight + 'px';
                    }
                });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.aics-embed-container').forEach(initCalculatorInstance);
    });
})();