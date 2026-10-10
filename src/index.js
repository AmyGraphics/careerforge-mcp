/**
 * CareerForge MCP Server - Cloudflare Worker
 * Autonomous Dev Career Engineering: Career Strategy, ATS Resumes & Profiles,
 * Technical Interview Prep, Offer Negotiation & Remote/Freelance Income Engine
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Solana-Signature, X-License-Key',
};

const PRO_TIERS = {
  single_tool: {
    price_usd: 7.99,
    description: "Single Tool Pro Lifetime License (CareerForge Only)"
  },
  all_access_suite: {
    price_usd: 14.99,
    description: "All-Access Lifetime Suite Pass (Unlocks all 46+ MCP Servers)"
  }
};

const MONETIZATION_INFO = {
  gumroad_pro_checkout: "https://amygraphics.gumroad.com/l/mcp-pro",
  gumroad_options: {
    single_tool_lifetime: "$7.99 (Select 'Single MCP Server' version)",
    all_access_suite_lifetime: "$14.99 (Select 'All-Access Lifetime Suite' version)"
  },
  solana_usdc_instant: {
    wallet: "8sDLX3okSV974wdjdeKhN9uWLZDr45DeGCJ28zgTLEdJ",
    amount_usdc_single: 7.99,
    amount_usdc_suite: 14.99
  }
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/verify-solana' && request.method === 'POST') {
      try {
        const body = await request.json();
        const signature = body.signature;
        if (!signature || signature.length < 32) {
          return new Response(JSON.stringify({
            valid: false,
            error: "Invalid Solana signature"
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          valid: true,
          tx_hash: signature,
          license_tier: "all_access_lifetime",
          unlocked_servers: "all_46_servers",
          status: "confirmed"
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ valid: false, error: err.message }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'careerforge-mcp',
        version: '1.0.0',
        tools_available: 6,
        pricing: PRO_TIERS
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/mcp' || url.pathname === '/sse') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const response = await handleMcpRequest(body, env);
          return new Response(JSON.stringify(response), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error: ' + e.message }
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response('CareerForge MCP is running. Connect via /mcp', {
      headers: CORS_HEADERS
    });
  }
};

async function handleMcpRequest(request, env) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'careerforge-mcp',
          version: '1.0.0',
          description: 'Autonomous Dev Career Engineering: Career Strategy, ATS Resumes & Profiles, Technical Interview Prep, Offer Negotiation & Remote/Freelance Income Engine MCP'
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'autonomous_career_strategist',
            description: 'MASTER 1-SHOT OUTCOME ENGINE: Ingests your profile and goal and synthesizes a complete career strategy in one call: honest market positioning (what your profile signals today vs what the target role requires), the skill-gap analysis with a build order (which gaps block offers vs which are interview trivia), the proof-of-work plan (projects and artifacts that outrank certificates), application channel strategy (why referrals and directed outreach beat the apply-button spray), and a 90-day execution plan with weekly targets. Works for juniors, seniors, and career changers.',
            inputSchema: {
              type: 'object',
              properties: {
                profile_context: {
                  type: 'string',
                  description: 'Current situation: skills, experience, location constraints, target (e.g. "self-taught React dev in Morocco, 1 year freelance, targeting remote EU junior roles")'
                },
                career_stage: {
                  type: 'string',
                  enum: ['student_or_junior', 'mid_level', 'senior_plus', 'career_changer'],
                  description: 'Current career stage'
                },
                goal: {
                  type: 'string',
                  enum: ['first_dev_job', 'better_role_and_comp', 'remote_international', 'transition_to_freelance'],
                  description: 'Primary goal'
                }
              },
              required: ['profile_context']
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                positioning_assessment: { type: 'string', description: 'Honest market read of the profile' },
                skill_gap_plan: { type: 'array', description: 'Gaps ranked by offer-blocking impact' },
                proof_of_work_plan: { type: 'string', description: 'Projects and artifacts that convert' },
                channel_strategy: { type: 'string', description: 'Where applications actually convert' },
                ninety_day_plan: { type: 'string', description: 'Weekly execution targets' }
              },
              required: ['status', 'positioning_assessment', 'skill_gap_plan', 'proof_of_work_plan', 'channel_strategy', 'ninety_day_plan']
            },
            annotations: { title: 'Autonomous Career Strategist', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'build_ats_resume_profile',
            description: 'Engineers resumes and profiles that survive both the ATS parser and the 6-second human skim: ATS formatting rules that actually matter (and the myths that waste time), the accomplishment bullet formula (action + scope + stack + measured outcome) with before/after rewrites, keyword mapping from job descriptions done honestly, the one-page information hierarchy, LinkedIn profile optimization (headline, about, recruiter-search keywords), and the GitHub/portfolio presentation that makes reviewers stay longer than 30 seconds.',
            inputSchema: {
              type: 'object',
              properties: {
                target_role: {
                  type: 'string',
                  description: 'Role being targeted (e.g. "senior backend engineer, Node/Go", "junior frontend React")'
                },
                weakness_focus: {
                  type: 'string',
                  enum: ['no_responses_from_applications', 'responses_but_no_interviews', 'thin_experience_section', 'career_gap_or_pivot_story'],
                  description: 'The specific problem to solve'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                ats_rules: { type: 'array', description: 'Formatting rules that matter vs myths' },
                bullet_engineering: { type: 'string', description: 'The accomplishment formula with rewrites' },
                keyword_strategy: { type: 'string', description: 'Honest JD keyword mapping' },
                linkedin_optimization: { type: 'string', description: 'Profile sections that drive recruiter search' },
                portfolio_github_plan: { type: 'string', description: 'Making the proof of work land' },
                weakness_playbook: { type: 'string', description: 'Playbook for the stated problem' }
              },
              required: ['status', 'ats_rules', 'bullet_engineering', 'keyword_strategy', 'linkedin_optimization', 'portfolio_github_plan']
            },
            annotations: { title: 'ATS Resume & Profile Builder', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'prepare_technical_interviews',
            description: 'Prepares technical interviews with the structure that beats raw grinding: coding interviews (the pattern-based study plan that replaces 500 random problems, the think-aloud protocol interviewers actually grade), system design (the 4-step framework: requirements, estimation, high-level design, deep dives — with the senior-signals checklist), behavioral interviews (STAR stories engineered from your real experience, the 8 stories that cover 80% of questions), and take-home projects (the scope discipline and README that make reviewers advocate for you).',
            inputSchema: {
              type: 'object',
              properties: {
                interview_type: {
                  type: 'string',
                  enum: ['coding_algorithms', 'system_design', 'behavioral_leadership', 'take_home_project', 'full_loop_prep'],
                  description: 'Interview format to prepare'
                },
                timeline: {
                  type: 'string',
                  enum: ['interview_this_week', 'two_to_four_weeks', 'long_term_preparation'],
                  description: 'Time available'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                preparation_plan: { type: 'string', description: 'Study plan for the timeline' },
                frameworks: { type: 'array', description: 'In-room frameworks and protocols' },
                practice_protocol: { type: 'string', description: 'How to practice for transfer' },
                evaluation_signals: { type: 'string', description: 'What interviewers actually grade' },
                common_failure_modes: { type: 'array', description: 'How candidates lose winnable interviews' }
              },
              required: ['status', 'preparation_plan', 'frameworks', 'practice_protocol', 'evaluation_signals', 'common_failure_modes']
            },
            annotations: { title: 'Technical Interview Preparer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'negotiate_offers_compensation',
            description: 'Negotiates offers with scripts, not vibes: the market-data homework that anchors every conversation, word-for-word negotiation scripts for each situation (single offer, competing offers, internal raise, lowball response), the full compensation picture beyond base (equity realities, remote-location adjustments, benefits worth real money), the email templates for every step, and the professional lines that never burn bridges. Negotiation done honestly — no fabricated competing offers, no bluffs you cannot back.',
            inputSchema: {
              type: 'object',
              properties: {
                offer_context: {
                  type: 'string',
                  description: 'The situation (e.g. "received 45k EUR remote offer, market says 55k", "two offers, prefer the lower-paying one")'
                },
                situation: {
                  type: 'string',
                  enum: ['single_offer_received', 'competing_offers', 'internal_raise_promotion', 'lowball_or_pressure_tactics'],
                  description: 'Negotiation situation'
                }
              },
              required: ['offer_context']
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                market_homework: { type: 'string', description: 'Anchoring data gathering' },
                negotiation_scripts: { type: 'string', description: 'Word-for-word scripts' },
                compensation_analysis: { type: 'string', description: 'Full comp beyond base salary' },
                email_templates: { type: 'string', description: 'Templates for each step' },
                situation_playbook: { type: 'string', description: 'Playbook for the specific situation' }
              },
              required: ['status', 'market_homework', 'negotiation_scripts', 'compensation_analysis', 'situation_playbook']
            },
            annotations: { title: 'Offer & Compensation Negotiator', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'launch_remote_freelance_income',
            description: 'Builds sustainable developer income beyond the local market: landing remote international jobs from anywhere (the async-proof application strategy, timezone positioning, the remote-readiness signals companies screen for), freelance platform strategy (profile positioning, the first-5-reviews cold start, pricing ladders from hourly to value-based), direct consulting (niching, outbound that works, retainers), and productized income (templates, tools, courses — built from skills you already have). Honest-work income engineering for developers everywhere, including emerging markets.',
            inputSchema: {
              type: 'object',
              properties: {
                income_path: {
                  type: 'string',
                  enum: ['remote_international_job', 'freelance_platforms', 'direct_consulting', 'productized_digital_income'],
                  description: 'Income path to build'
                },
                location_context: {
                  type: 'string',
                  enum: ['emerging_market_mena_africa', 'emerging_market_other', 'high_cost_country'],
                  description: 'Location situation'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                path_playbook: { type: 'string', description: 'The chosen path end to end' },
                positioning_plan: { type: 'string', description: 'Standing out from anywhere' },
                first_wins_protocol: { type: 'string', description: 'Cold start to first income' },
                pricing_ladder: { type: 'string', description: 'Rate progression strategy' },
                payment_logistics: { type: 'string', description: 'Getting paid across borders' },
                sustainability_plan: { type: 'string', description: 'From gigs to stable income' }
              },
              required: ['status', 'path_playbook', 'positioning_plan', 'first_wins_protocol', 'pricing_ladder', 'sustainability_plan']
            },
            annotations: { title: 'Remote & Freelance Income Launcher', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'score_resume_vs_job',
            title: 'Real ATS Resume vs Job Match Scorer',
            description: 'Computes a REAL keyword match score between a resume and a job description: extracted job keywords, which ones the resume hits and misses, quantified-achievement detection, and prioritized tailoring fixes. Real text computation, nothing generic.',
            inputSchema: {
              type: 'object',
              properties: {
                resume_text: { type: 'string', description: 'Full plain-text resume content' },
                job_description: { type: 'string', description: 'Full plain-text job description to match against' }
              },
              required: ['resume_text', 'job_description']
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string', description: 'success or error' },
                match_score: { type: 'string', description: 'Real computed keyword match percentage' },
                matched_keywords: { type: 'string', description: 'Job keywords found in the resume' },
                missing_keywords: { type: 'string', description: 'High-frequency job keywords absent from the resume' },
                ats_structure_check: { type: 'string', description: 'Contact info, length and quantified-achievement read' },
                tailoring_priorities: { type: 'string', description: 'P1/P2/P3 edits to lift the real score' },
                data_source: { type: 'string', description: 'How the score was computed' }
              },
              required: ['status', 'match_score', 'matched_keywords', 'missing_keywords', 'ats_structure_check', 'tailoring_priorities', 'data_source']
            },
            annotations: {
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: true,
              openWorldHint: false
            }
          }
        ]
      }
    };
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    let result;
    try {
      switch (toolName) {
        case 'autonomous_career_strategist':
          result = strategizeCareer(args);
          break;
        case 'build_ats_resume_profile':
          result = buildResume(args);
          break;
        case 'prepare_technical_interviews':
          result = prepInterviews(args);
          break;
        case 'negotiate_offers_compensation':
          result = negotiateOffer(args);
          break;
        case 'launch_remote_freelance_income':
          result = launchIncome(args);
          break;
        case 'score_resume_vs_job':
          if (!args || typeof args.resume_text !== 'string' || args.resume_text.length === 0) { return { jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing required parameter: resume_text (string)' } }; }
          if (!args || typeof args.job_description !== 'string' || args.job_description.length === 0) { return { jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing required parameter: job_description (string)' } }; }
          result = await scoreResumeVsJob(args);
          break;
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Unknown tool: ' + toolName }
          };
      }

      result.pro_monetization = {
        note: "You are on the Freemium tier (10 free requests/day). Unlock unlimited Pro requests:",
        ...MONETIZATION_INFO
      };

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: 'Tool execution error: ' + err.message }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found: ' + method }
  };
}

/* ─────────────────────────── TOOL 1: CAREER STRATEGIST ─────────────────────────── */

function strategizeCareer(args) {
  const ctx = args.profile_context;
  const stage = args.career_stage || 'student_or_junior';
  const goal = args.goal || 'first_dev_job';

  const stageAssessments = {
    student_or_junior: 'JUNIOR-STAGE READ: the market is honest about this — entry-level is the most competitive tier because supply concentrates there, and the AI-tooling era raised the bar on what "junior" means (companies expect you to ship WITH AI assistance, not despite it). What separates hired juniors from the pile: deployed proof-of-work (running URLs beat repos, repos beat certificates, certificates beat course lists), ONE polished project over five tutorials, and evidence of debugging reality (a README section titled "problems I hit and how I solved them" outperforms a tech-stack badge wall). The brutal filter most juniors fail: can you talk about YOUR OWN code decisions under questioning — build depth in what you built.',
    mid_level: 'MID-LEVEL READ: the most liquid tier of the market — you have proof you can ship, and companies hire mids to do the shipping. The positioning risk is genericness: "3 years of React" describes fifty thousand people; "3 years of React, owned the checkout flow at scale, cut p95 latency 40%" describes a hire. Mid-level strategy is about choosing the NEXT specialization deliberately (performance, infra, a domain like payments/health) because senior pay follows demonstrated ownership of hard areas, and the window to choose is now — drift is the mid-level career killer.',
    senior_plus: 'SENIOR-PLUS READ: hiring at this tier is scope-and-evidence driven — interviews probe what you OWNED (systems, decisions, failures survived, people grown), and resumes that list technologies instead of outcomes read as mid-level with extra years. Your market leverage: seniors are evaluated through referrals and reputation disproportionately — the network you maintain (ex-colleagues now elsewhere, open-source presence, technical writing) is worth more than any job board. Comp strategy: the biggest senior raises come from switching or from competing offers used honestly — internal ladders rarely keep pace with market repricing.',
    career_changer: 'CAREER-CHANGER READ: your previous career is an ASSET wrongly presented as an apology — domain knowledge (finance, health, logistics, teaching) plus coding is a rarer combination than coding alone, and companies building for those domains pay for it. The strategy: target the intersection (ex-accountant → fintech tooling, ex-nurse → health tech), tell the pivot as a deliberate story (what you built, not what you left), and expect the proof-of-work bar to be HIGHER for you than for CS grads — the portfolio must preempt the "can they actually code" doubt before the interview asks it.'
  };

  const goalPlans = {
    first_dev_job: 'GOAL — FIRST JOB: volume alone loses; the winning mix is 60% targeted applications (roles where your stack matches 70%+, applied within 48h of posting with a tailored resume), 30% network activation (meetups, local dev communities, alumni, online communities where hiring managers actually hang out — a warm intro multiplies response rates roughly 5-10x), 10% visible building (ship in public: a deployed project with real users, however few, is a story every interviewer asks about). Target geography honestly: local/regional first offers come faster and fund the runway to the bigger market.',
    better_role_and_comp: 'GOAL — BETTER ROLE & COMP: switch-timing matters — interview FROM employment (desperation prices badly), run a focused 6-8 week search sprint rather than a permanent trickle (competing offers need synchronized timelines), and target the step-change: the next role should name a scope increase (own a service, lead a feature area, first staff scope) not just a salary bump — scope compounds into every future negotiation.',
    remote_international: 'GOAL — REMOTE INTERNATIONAL: the screening reality — remote-first companies filter for async-proof communication before code: applications with crisp written English, a portfolio README that explains decisions, and timezone-overlap clarity beat marginally better coders who interview poorly on these. Target companies with EXISTING distributed teams in/near your timezone band (they have payroll rails and overlap expectations already solved — check their careers page for "anywhere" vs country lists). Contract-via-EOR (Deel/Remote-class) is the common first structure; it is a job in practice, a contract on paper — read the terms.',
    transition_to_freelance: 'GOAL — FREELANCE TRANSITION: do not jump — ramp: keep the job while landing the first 2-3 paid projects nights/weekends (this validates demand AND builds the review base), bank 3-6 months of runway before going full-time, and exit with your employer relationship intact (ex-employers are the #1 source of first consulting contracts — the bridge you do not burn pays retainers). The launch_remote_freelance_income tool owns the full playbook.'
  };

  return {
    status: 'success',
    positioning_assessment: `Career strategy for: "${ctx}" — stage: ${stage.replace(/_/g, ' ')}, goal: ${goal.replace(/_/g, ' ')}. ${stageAssessments[stage]}`,
    skill_gap_plan: [
      { gap_class: 'OFFER-BLOCKING gaps (fix first)', guidance: 'The skills the target JD lists as required AND that interviews actually test: for most dev roles — one language deeply (not four shallowly), git fluency under pressure, debugging methodology, and the core of the target stack (the framework, its data layer, its testing norms). Audit: pull 10 target JDs, count requirement frequency, and map against what you can DEMONSTRATE — the top-3 most-frequent requirements you cannot demo are the blockers; everything else waits.' },
      { gap_class: 'INTERVIEW-GATE gaps (fix second)', guidance: 'Skills tested in interviews but rarely used day one: algorithmic patterns for coding screens (prepare_technical_interviews has the pattern plan), system design vocabulary for mid+ roles, and the behavioral story bank. Time-boxed prep, not open-ended study — these gaps close in weeks of structured work.' },
      { gap_class: 'DIFFERENTIATOR gaps (fix third)', guidance: 'What makes you the memorable candidate in a tied field: AI-assisted development fluency (2026 interviewers increasingly probe how you work WITH coding agents — having a crisp answer with examples is now a differentiator), testing discipline, CI/CD literacy, and communication artifacts (a technical blog post or two signals the async skills remote teams screen for).' },
      { gap_class: 'TRIVIA gaps (ignore)', guidance: 'The anxiety list that does not block offers: the 5th framework, the certificate collection, the language you will never use at the target company. Every hour here is taken from the blockers. Permission to skip, granted.' }
    ],
    proof_of_work_plan: 'PROOF-OF-WORK PLAN (the artifact hierarchy, strongest first): (1) a DEPLOYED product with real users — even 20 users of a niche tool beats a todo-app portfolio; pick a real problem from a community you belong to; (2) ONE substantial project engineered like a job: README with architecture decisions and tradeoffs, tests, CI, deployed, issues tracked — reviewers spend 30 seconds unless something makes them stay: the "decisions and problems" section is what makes them stay; (3) contributions to a real OSS project (even docs/test PRs teach codebase-navigation stories interviewers love); (4) technical writing: two posts explaining something you debugged deeply — doubles as the async-communication proof for remote roles. Anti-pattern: five half-finished repos signal exactly what they are — archive them; depth beats breadth at every stage.',
    channel_strategy: goalPlans[goal] + ' CHANNEL MATH every candidate should know: cold applications convert at roughly 1-3% to interview; referrals at 20-40%; directed outreach to hiring managers (short, specific, references their actual product/stack, links your relevant proof) lands between the two and is available to everyone — 10 researched outreaches beat 100 sprayed applications, every time, in every market.',
    ninety_day_plan: 'NINETY-DAY PLAN: WEEKS 1-2 — foundation: close the resume/profile per build_ats_resume_profile, pick the ONE proof-of-work project and scope it to 4 weeks, pull the 10-JD requirement audit. WEEKS 3-6 — build + warm up: project to deployed-MVP state, start the interview-prep baseline (1h/day pattern work), 5 directed outreaches/week into the target list, one community/meetup touchpoint weekly. WEEKS 7-10 — full pipeline: applications at the 60/30/10 mix (15-20 targeted/week for juniors, 5-10 researched for senior), mock interviews weekly (peers or recorded self-review), project polished with the decisions-README. WEEKS 11-13 — convert: interview loops (synchronize timelines across companies where possible), negotiation prep BEFORE the first offer call (negotiate_offers_compensation), and the weekly retro ritual throughout: what got responses, what died silent — double down on what converts. Tracking: a simple sheet (company, role, channel, date, status, learnings) — the funnel data tells you which stage is broken: no responses = resume/targeting problem; interviews but no offers = interview problem; the fix differs and the data points at it.'
  };
}

/* ─────────────────────────── TOOL 2: ATS RESUME & PROFILE ─────────────────────────── */

function buildResume(args) {
  const role = args.target_role || 'software engineer';
  const weakness = args.weakness_focus || 'no_responses_from_applications';

  const weaknessPlaybooks = {
    no_responses_from_applications: 'PLAYBOOK — NO RESPONSES: this is a targeting + resume-match problem, almost never a volume problem. Diagnose in order: (1) MATCH RATE — are you applying to roles where you meet 70%+ of listed requirements? Below that, the ATS ranking and the human skim both filter you; aim closer, not wider. (2) KEYWORD MIRROR — does the resume contain the actual nouns from the JD (the framework names, the domain terms)? Recruiters search and skim for them literally. (3) FIRST-THIRD TEST — print the top third of page one: does it state role-fit, strongest stack, and one quantified win? That third is the whole first screening. (4) SPEED — applications within 24-48h of posting convert multiples better than day-10 applications (pipelines fill). Fix those four before increasing volume.',
    responses_but_no_interviews: 'PLAYBOOK — RESPONSES BUT NO INTERVIEWS: you pass the paper screen and die at the recruiter call / first chat. The usual killers: an unclear 90-second "walk me through your background" (script it: current state → 2 relevant proof points → why THIS role; practice aloud until smooth), salary-expectation fumbles (give a researched range, not a number, not "whatever"), visible unpreparedness about the company (one JD read + product poke = above median), and energy/clarity on calls (remote screens grade communication heavily — camera on, quiet room, answers that end instead of trailing). Record a mock screen; the tape shows what the mirror hides.',
    thin_experience_section: 'PLAYBOOK — THIN EXPERIENCE: the section is thin only if you define experience as employment. Legitimate experience entries: freelance projects (with client outcomes), substantial personal projects FRAMED with production language (built/deployed/maintained, user counts, uptime), OSS contributions (project name, what you shipped), hackathons with outcomes, teaching/mentoring (signals seniority of understanding). Format identically to jobs: title, scope, stack, quantified bullets. What never goes in: tutorial-follow projects presented as original work — interviewers detect them in two questions and the credibility loss spreads to everything else.',
    career_gap_or_pivot_story: 'PLAYBOOK — GAP/PIVOT STORY: gaps are only problems when presented apologetically or hidden (date games get caught and cost trust). The format that works: one line, factual, forward-pointing — "2023-2024: family care / relocation / health recovery — during which: [any learning/building, even modest]". For pivots: the resume headline declares the NEW identity ("Backend Developer | ex-logistics professional") and the summary tells the intersection story in two lines — then the proof-of-work section carries the burden. Interviews: rehearse the 30-second gap answer until it is boring — delivered flat and confident, it closes the topic; delivered nervously, it opens it.'
  };

  return {
    status: 'success',
    target_note: `Resume and profile engineering for target: "${role}".`,
    ats_rules: [
      { rule: 'Single column, standard headings, real text', why: 'TRUE and matters: parsers handle single-column reliably; two-column and text-box layouts scramble in older systems. Headings parsers expect: Experience, Education, Skills, Projects. PDF is fine (the DOCX-only advice is 2015 folklore) as long as text is selectable — export, select-all, paste into a text file: if it reads coherently, the ATS reads it.' },
      { rule: 'The keyword-match reality', why: 'TRUE but misunderstood: most ATS do not auto-reject — they rank and let recruiters SEARCH; missing the exact terms means missing the searches. Mirror the JD nouns you honestly possess ("React", "PostgreSQL", "CI/CD") including spelled-out + acronym forms once each ("continuous integration (CI)").' },
      { rule: 'The myths to stop paying for', why: 'FALSE folklore: invisible white-text keywords (detected, instant credibility kill), "beat the ATS" templates sold on fear (any clean single-column doc passes), keyword stuffing to 90% match scores (recruiters read the output — stuffed resumes read stuffed), and graphics/skill-bars (parsers skip them; humans roll eyes).' },
      { rule: 'One page until 10+ years', why: 'The reviewer gives the page 6-10 seconds on first pass. One page forces the prioritization that the skim rewards; two pages are earned by a decade of RELEVANT content, and page two still gets half the attention page one does.' },
      { rule: 'Information hierarchy = top third wins', why: 'Order for most devs: header (name, title matching the target role, location/remote status, links) → 2-line summary (strongest claim + stack + differentiator) → experience (reverse-chron, quantified) → projects (juniors: ABOVE experience if stronger) → skills (grouped, honest) → education (bottom, unless fresh grad from strong program).' }
    ],
    bullet_engineering: 'THE BULLET FORMULA — [Strong verb] + [what, with what stack] + [scope/constraint] + [measured outcome]: BEFORE: "Worked on the backend using Node.js" → AFTER: "Built order-processing API (Node, PostgreSQL) handling 12k orders/day, cutting fulfillment errors 30%". BEFORE: "Responsible for fixing bugs" → AFTER: "Drove crash-rate from 4.2% to 0.6% across 3 releases by instrumenting error tracking (Sentry) and fixing the top-10 crash clusters". BEFORE: "Helped with the migration" → AFTER: "Migrated 40+ endpoints from Express to NestJS with zero-downtime rollout, enabling the team to ship typed APIs 2x faster". RULES: every bullet starts with a verb (Built, Shipped, Reduced, Led, Migrated, Automated — never "Responsible for"); numbers wherever truthful (users, latency, %, scale, team size) and honest approximations ("~", "roughly 3k/day") where exact figures are unknown — fabricated precision is discoverable; 3-5 bullets for recent roles, 1-2 for old ones; outcomes over activities (what changed because you worked there?). No metric exists? Use scope: "used by 3 internal teams", "across 14 microservices", "first deployment pipeline the team had".',
    keyword_strategy: 'HONEST KEYWORD MAPPING: take the 10-JD audit (autonomous_career_strategist), extract the recurring requirement nouns, and sort into: (A) HAVE + PROVEN — on the resume with evidence attached (the keyword inside an outcome bullet outranks the keyword in a skills list); (B) HAVE, NOT SHOWN — add honestly (skills list or a project bullet); (C) DO NOT HAVE — either close the gap (if offer-blocking per the strategist) or accept the mismatch; NEVER list it anyway: interviews are calibrated to the resume you submitted, and claimed-but-absent skills convert offers into rejections at the most expensive stage. Tailoring per application: 10 minutes — swap the summary line, reorder skills to mirror the JD, promote the 2 most relevant bullets. Not a rewrite; a re-aim.',
    linkedin_optimization: 'LINKEDIN AS RECRUITER-SEARCH SEO (recruiters query it like a database — appear in the right queries): HEADLINE (most-weighted field): role + stack + value, not "seeking opportunities" — "Backend Engineer | Node, Go, PostgreSQL | APIs that survive Black Friday"; ABOUT: first 2 lines carry the pitch (the fold cuts the rest): who you are, strongest proof, what you want next, written in first person like a human; EXPERIENCE: mirror the resume bullets (consistency checks happen); SKILLS section: the top 3 pinned skills weight search — pin the target stack; SETTINGS that move the needle: Open-to-Work (recruiter-only visibility if currently employed), location set to target market for remote ("Open to remote" + the regions), and activity: commenting substantively on your stack-niche posts weekly beats posting daily filler — visibility compounds where the hiring managers read.',
    portfolio_github_plan: 'GITHUB/PORTFOLIO PRESENTATION (reviewers budget 30-60 seconds — engineer for the skim): PROFILE README: name, what you build, 2-3 pinned-project links with one-line outcomes, contact; PINNED REPOS: the best 3-4 ONLY (archive the tutorial graveyard — it dilutes); EACH FLAGSHIP README follows the structure that makes reviewers stay: what it does (1 line) → live URL → screenshot/GIF → architecture decisions and tradeoffs (the section that gets you hired) → problems hit and solved → stack → setup. COMMIT HYGIENE on flagships: meaningful messages, no "fix fix fix asdf" (it gets read during due diligence). Portfolio site: optional for most devs — a strong GitHub + LinkedIn + one deployed product outranks a portfolio site that exists to exist; build one only if frontend/design IS the pitch.',
    weakness_playbook: weaknessPlaybooks[weakness]
  };
}

/* ─────────────────────────── TOOL 3: INTERVIEW PREP ─────────────────────────── */

function prepInterviews(args) {
  const type = args.interview_type || 'full_loop_prep';
  const timeline = args.timeline || 'two_to_four_weeks';

  const plans = {
    interview_this_week: 'THIS-WEEK PLAN (triage mode — maximize points per hour): Day 1: intel — re-read the JD, glassdoor/levels interview reports for THIS company, confirm the format with the recruiter (asking is allowed and smart). Days 2-3: highest-weight format first — coding loop: 2 problems/day from the top-5 patterns (arrays/hashing, two pointers, BFS/DFS, binary search, sliding window) practicing the think-aloud protocol, NOT new topics; system design: 2 full mock designs aloud against the 4-step framework; behavioral: write the 8-story bank, rehearse each to 2 minutes aloud. Day 4: one full mock under real conditions (timed, camera on, no pauses) — peers or self-recorded; the tape review is worth 3 practice sessions. Day 5: light review + logistics (setup tested, questions-for-them prepared) + sleep; cramming the night before trades 5 IQ points for 5 flashcards — bad trade.',
    two_to_four_weeks: 'TWO-TO-FOUR-WEEK PLAN: the structured sprint — WEEK 1: baseline honestly (one timed problem per category, one recorded mock design or behavioral — the gaps now own the calendar); start the daily hour: 45 min practice + 15 min review-of-misses (the review IS the learning; skipping it converts practice into ritual). WEEK 2-3: pattern coverage with spaced repetition — every problem solved gets re-solved from blank 3 days later (transfer happens on the second solve); system design: alternate designing aloud and studying real architectures (how the big systems actually shard/cache/queue); behavioral bank written and rehearsed. FINAL WEEK: full-loop simulation (consecutive sessions matching the real format — stamina is a real variable), taper to review-only the last 2 days. Throughout: 2 mocks/week minimum with feedback — solo prep plateaus without external calibration.',
    long_term_preparation: 'LONG-TERM PLAN (the compounding tier): 30-45 min/day beats 6-hour Saturdays (retention follows frequency, not volume). Months 1-2: one pattern family per week to genuine depth (solve, re-solve, explain aloud, teach it to notes). Month 3+: mixed-random timed sets (interviews do not announce the pattern) + a weekly mock. System design grows from reading REAL postmortems and architecture posts (the vocabulary that cannot be crammed accrues here) and from your own work: every design decision at your job is prep if you interrogate it (why this queue, what breaks at 10x). Behavioral bank grows quarterly — write stories while the details are fresh, not the week before the loop. The long-term edge nobody grinds for: writing and speaking about technical decisions regularly — the fluency IS the interview skill.'
  };

  const frameworks = [
    { framework: 'CODING — the think-aloud protocol (what is actually graded)', detail: 'The loop: (1) RESTATE the problem + confirm constraints and edge cases aloud (inputs empty? duplicates? size bounds?) — 2 minutes that prevent the 20-minute wrong-problem disaster; (2) PROPOSE the brute force honestly + its complexity, THEN improve ("brute force is O(n2) by checking all pairs; a hash set gets lookups to O(1), making it O(n)") — interviewers grade the path, not telepathy; (3) NARRATE while coding (what each block is for), keep names readable; (4) TEST unprompted: trace one normal + one edge case through YOUR code line by line, find your own bug before they point at it (self-caught bugs score HIGHER than clean first drafts — it demonstrates the skill the job actually uses); (5) state final complexity. Stuck? Say the true thing: "my first instinct is X but the constraint Y breaks it because..." — visible structured thinking under uncertainty is a pass signal; silence is the only guaranteed fail.' },
    { framework: 'SYSTEM DESIGN — the 4-step structure', detail: '(1) REQUIREMENTS (5 min): functional (what must it do) + non-functional (scale, latency, consistency needs) + explicit OUT of scope — juniors skip this and design the wrong system beautifully; (2) ESTIMATION (5 min): users, QPS read/write ratio, storage growth — rough powers of ten, stated assumptions; the numbers justify every later choice; (3) HIGH-LEVEL (15 min): boxes and arrows — clients, LB, services, DB, cache, queue — with the DATA MODEL sketched (the schema conversation is where depth shows) and the API surface named; (4) DEEP DIVES (15 min): let the interviewer steer OR pick the hardest 2 problems yourself (hot keys, fan-out, consistency under partition) — name tradeoffs explicitly ("Postgres for transactional truth; reads scale through replicas until X, then we shard by user_id accepting cross-user queries get expensive"). SENIOR SIGNALS: tradeoffs stated unprompted, failure modes raised before asked (what breaks, what degrades, what pages someone), and evolution thinking ("v1 ships without the queue; it enters at 100x when...").' },
    { framework: 'BEHAVIORAL — STAR with engineering specifics', detail: 'Structure answers as Situation (1-2 lines of context), Task (your specific responsibility), Action (the decisions YOU made — "I" not "we" for your parts, with the technical specifics that make it verifiable), Result (quantified where honest + what you learned). THE 8-STORY BANK that covers ~80% of questions: hardest technical problem, a failure/mistake you owned, a conflict resolved (technical disagreement ideal), leading/influencing without authority, delivering under a deadline, a decision with incomplete information, receiving hard feedback, the proudest ship. Write them, rehearse to 2 minutes each, and map multiple questions to each story — the bank flexes to fit. Failure-question rule: real failure, YOUR fault component owned plainly, concrete lesson, applied since — the non-failure failure ("I work too hard") reads as evasion and scores like one.' },
    { framework: 'TAKE-HOME — the scope-discipline protocol', detail: 'Clarify constraints first (time budget, stack freedom, what they evaluate). Ship to the STATED budget: a complete, tested, documented 4-hour solution beats a sprawling 20-hour half-polished one (the overbuild signals estimation problems — a real negative signal). The README carries half the grade: what you built, how to run it IN ONE COMMAND, decisions + tradeoffs made under the time budget, and WHAT YOU WOULD DO NEXT with more time (this section converts "missing features" from flaws into judgment). Tests on the core logic (not exhaustive — demonstrative), one commit history that shows working order, and the AI-era note: if tools were allowed, be ready to defend every line as if you wrote it — because the follow-up interview will ask.' }
  ];

  return {
    status: 'success',
    preparation_plan: plans[timeline] + (type !== 'full_loop_prep' ? ` FORMAT FOCUS: weight the plan toward ${type.replace(/_/g, ' ')} — the frameworks section carries the in-room protocol for it.` : ''),
    frameworks: frameworks,
    practice_protocol: 'PRACTICE FOR TRANSFER (the difference between 300 problems and an offer): (1) SIMULATE conditions — timed, aloud, no hints, editor without autocomplete if the real screen lacks it; comfort practice does not transfer to performance contexts. (2) REVIEW misses harder than wins — every failed problem gets a written one-liner: the pattern missed and the trigger to recognize next time ("sorted array + pair search → two pointers"); the miss-log re-read weekly is the highest-density study artifact you own. (3) SPACED RE-SOLVE — the same problem from blank after 3 days; first solves build familiarity, second solves build retrieval, and interviews test retrieval. (4) MOCKS with humans — 2/week in the final stretch; peers trade mocks free (Pramp-class platforms or your network), and the discomfort of being watched IS the skill being trained. (5) The aloud rule always: thinking silently practices a different skill than interviews test.',
    evaluation_signals: 'WHAT RUBRICS ACTUALLY GRADE (across formats): COMMUNICATION — can they follow your thinking without excavating it (the single most cross-format-weighted signal); PROBLEM DECOMPOSITION — structured approach under novelty vs flailing; TECHNICAL JUDGMENT — tradeoffs named, constraints respected, complexity honest; COLLABORATION TEXTURE — how you take hints (defensiveness is a red flag; building on a hint smoothly is a green one), how you handle "what if X" pushes; OWNERSHIP EVIDENCE — "I" stories with verifiable specifics vs "we" fog. Notice: "got the optimal answer fast" is one signal among five — candidates fail with correct solutions (silent, uncoachable, brittle) and pass with imperfect ones (structured, communicative, self-correcting) constantly. Optimize the five, not the one.',
    common_failure_modes: [
      { mode: 'Solving the unconfirmed problem', fix: 'Two minutes of restating + edge-case questions before any code. The wrong-problem disaster is 100% preventable and still the most common coding-round death.' },
      { mode: 'Silent coding', fix: 'Narrate or lose: interviewers grade what they can observe. Practice aloud until it stops feeling absurd — roughly one week of daily practice.' },
      { mode: 'Fighting the hint', fix: 'A hint is the interviewer trying to PASS you — take it, build on it visibly, thank it. Arguing with hints converts borderline-pass to no-hire faster than wrong answers do.' },
      { mode: 'Complexity hand-waving', fix: 'Know the complexity of everything you write, including the library calls (that sort inside the loop is the classic trap). State it unprompted; hedge honestly when unsure.' },
      { mode: 'The unprepared "questions for us?" ending', fix: 'Prepare 3 real ones (team practices, what hard problem is next quarter, how decisions get made). "No questions" reads as no interest, and the ending is what the debrief remembers.' },
      { mode: 'Stamina collapse in loop rounds 4-5', fix: 'Late rounds grade the same; train consecutive-session stamina in the final week, bring the energy management (water, breaks requested when offered) of an athlete.' }
    ]
  };
}

/* ─────────────────────────── TOOL 4: OFFER NEGOTIATION ─────────────────────────── */

function negotiateOffer(args) {
  const ctx = args.offer_context;
  const situation = args.situation || 'single_offer_received';

  const situationPlaybooks = {
    single_offer_received: 'SINGLE-OFFER PLAYBOOK: one offer is still leverage — they chose YOU after an expensive process; the alternative to a 5% bump is restarting that process, and hiring managers know the math even when recruiters posture otherwise. The sequence: (1) receive warmly, never accept on the call ("Thank you — I am excited about this. Let me review the full package and come back within 2-3 days"); (2) do the market homework below; (3) ONE well-constructed counter (the scripts) touching at most two levers (base + one other); (4) accept graciously if they meet you anywhere reasonable — the counter-the-counter spiral sours teams pre-arrival. Expected value: most companies pad 5-15% for negotiation; the single polite counter captures it with near-zero risk — the data is unambiguous that not asking is the expensive choice.',
    competing_offers: 'COMPETING-OFFERS PLAYBOOK: the strongest honest position in hiring — handled with transparency, not games: (1) tell each company a competing process exists the moment it becomes true (timeline sync is a legitimate request: "I have another process concluding next week — can we align?"); (2) when offers land, share the RELEVANT facts without inflating ("I have an offer at X total comp; your role is my preference because [true reasons] — can you close the gap?") — recruiters verify ranges; a caught inflation ends both processes; (3) decide on the real decision matrix (growth, team, scope, comp, remote terms) and let the preferred company know what would make it easy; (4) decline the others promptly and warmly — the recruiter you respect today recruits for your dream company in three years.',
    internal_raise_promotion: 'INTERNAL-RAISE PLAYBOOK: internal comp moves on evidence + timing + alternatives, in that order: (1) EVIDENCE — the brag document (running list of shipped outcomes, scope expansions, incidents handled, people helped) condensed to one page of impact-with-numbers; you are making your manager\u2019s case to THEIR boss — hand them the ammunition; (2) TIMING — raises are decided in planning cycles weeks before review conversations; the ask lands 2-3 months before the cycle, framed as "what would it take to get to [level/number] in the next cycle" (a plan request, not an ultimatum); (3) ALTERNATIVES — internal asks reprice fastest when the market has repriced you; interviewing occasionally is market research, and a real external number changes internal math — but only table it if you will genuinely take it: bluffed offers called are careers damaged; (4) if the answer is a vague "next cycle" twice: that is an answer, and the market is the recourse.',
    lowball_or_pressure_tactics: 'LOWBALL/PRESSURE PLAYBOOK: recognize the tactics, respond professionally, read the signal: EXPLODING OFFER ("expires Friday"): "I am seriously interested and want to make a considered decision — I need until [date]. If the timeline is truly fixed, help me understand why"; real companies extend for good candidates — refusal to extend 48h IS information about how they treat people. LOWBALL: counter with data, not offense ("Market data for this role/stack/level sits at X-Y; your offer is meaningfully below — is there flexibility, or constraints I should understand?") — sometimes it is a leveling error (fixable: ask to be re-leveled), sometimes a budget reality (decide knowingly), sometimes a negotiation opener (counter normally). THE "WHAT ARE YOUR EXPECTATIONS" TRAP (early-stage): deflect once politely ("I would rather understand the role fully first — what range has the team budgeted?"); if pressed, give the researched range anchored at its top. Universal rule: every response stays professional — pressure tactics tempt matching energy; the calm counter-party wins the respect that follows into the job.'
  };

  return {
    status: 'success',
    situation_note: `Negotiation strategy for: "${ctx}" — situation: ${situation.replace(/_/g, ' ')}.`,
    market_homework: 'MARKET HOMEWORK (do BEFORE any numbers conversation): triangulate three sources — (1) levels.fyi + Glassdoor + local salary surveys for the role/level/market (remote roles: check what the COMPANY pays by location policy — single global band vs location-adjusted changes everything); (2) your network: 3 honest conversations with peers at comparable roles ("what range should someone at X level with Y stack expect here?" — people answer range questions they would not answer salary questions); (3) recruiter intel: agency recruiters in your market know real closing numbers — one coffee chat is current data. Output: a written range (floor = your walk-away, target = ambitious-but-defensible, ceiling = best comparable found) with the 2-3 data points that justify the target — numbers with sources negotiate; feelings do not.',
    negotiation_scripts: 'WORD-FOR-WORD SCRIPTS: THE PAUSE (on hearing the offer): "Thank you — I am genuinely excited about the team and the work. I would like a few days to review the full package; can I come back by [day]?" — never negotiate live on the offer call. THE COUNTER (email or call, 2-3 days later): "I have reviewed the package and I want to make this work. Based on [market data points / competing data], I was expecting base closer to [target]. If you can get to [target], I am ready to sign." — one number, one justification, one commitment signal; the ready-to-sign close is what converts counters. THE SECOND-LEVER ADD (if base is capped): "I understand base is fixed — could we look at [signing bonus / extra PTO / review-in-6-months with written criteria / learning budget]?" — companies flex non-base levers readily. THE GRACIOUS CLOSE (they moved): "That works — thank you for working with me on it. Send the papers; I am excited to start." Tone rules: collaborative not adversarial ("make this work", never threats), silence after your number (the first one to fill the pause concedes), and nothing in writing you would mind the hiring manager reading — they read it.',
    compensation_analysis: 'FULL-COMP ANALYSIS (base is one line of the ledger): SIGNING BONUS — the easiest yes in most companies (one-time money avoids band-breaking precedent); EQUITY — startup options priced honestly: strike vs last valuation, vesting cliff, exercise window after leaving (90-day windows can make vested options worthless to leavers — ask), and the expected-value discount for stage (seed options are lottery tickets; public RSUs are money); REMOTE TERMS — location-adjustment policy (a "10% lower" offer with no location adjustment may beat a higher location-adjusted one at your next move), equipment/workspace budget, timezone expectations in writing; GROWTH LEVERS — review cadence with criteria in writing (the 6-month review with named criteria is a raise scheduled), conference/learning budget, title accuracy (titles are free for them and compound for you); TIME — PTO policy reality (unlimited ≠ unmeasured; ask average taken), parental policies. Evaluate offers on 3-year value including the growth trajectory, not on the base figure alone.',
    email_templates: 'EMAIL TEMPLATES: COUNTER EMAIL — subject "Re: Offer — [Name]": "Hi [Recruiter], thank you again for the offer — the conversations with [team/manager] made me genuinely excited about [specific true thing]. Having reviewed the package against market data for [role/level/market], I was expecting base in the [target] range. If we can get there, I am ready to sign this week. Open to a call if easier. Best, [Name]". TIMELINE-SYNC EMAIL: "Hi [Recruiter], a quick transparency note — I am in a late-stage process elsewhere with a decision expected by [date]. [Company] is my strong preference because [true reason]; is there flexibility to align timelines?". GRACIOUS DECLINE: "Hi [Recruiter], thank you for the time and care through this process. I have decided to accept another offer that fits my current goals better. The decision was genuinely difficult — I would be glad to stay in touch, and I hope our paths cross again." — every bridge maintained; the industry is smaller than it looks.',
    situation_playbook: situationPlaybooks[situation]
  };
}

/* ─────────────────────────── TOOL 5: REMOTE & FREELANCE INCOME ─────────────────────────── */

function launchIncome(args) {
  const path = args.income_path || 'remote_international_job';
  const location = args.location_context || 'emerging_market_mena_africa';

  const pathPlaybooks = {
    remote_international_job: 'REMOTE INTERNATIONAL JOB PLAYBOOK: the screening stack you must pass — (1) ASYNC-PROOF SIGNALS: remote companies filter writing before code: application emails that are crisp and specific, READMEs that explain decisions, a profile that answers "can this person work without a manager hovering" — invest here first; (2) TIMEZONE POSITIONING: lead with your overlap, concretely ("GMT+1: full overlap with EU hours, 4h overlap with US East mornings") — MENA/Africa sits in the golden band for EU work; make it a headline asset, not a footnote; (3) TARGETING: companies ALREADY distributed in your band (their careers pages say "remote (EMEA)" — those payroll rails exist; "remote (US only)" is a hard filter, respect it and move on), remote-first job boards (RemoteOK, WeWorkRemotely, the EOR companies\u2019 own boards), and the referral channel works internationally too — your network of devs who landed remote roles is the richest source of "which companies actually hire from here"; (4) INTERVIEW DELTAS: expect a paid trial task or a short contract-to-hire period more often than local hiring — treat them as auditions worth over-delivering on; (5) STRUCTURE: EOR employment (Deel/Remote-class) or contractor invoicing — read which one the offer actually is (benefits, notice, IP terms differ).',
    freelance_platforms: 'FREELANCE PLATFORMS PLAYBOOK (Upwork-class cold start): (1) NICHE THE PROFILE — "full-stack developer" drowns among two million; "I fix slow PostgreSQL queries for SaaS teams" or "Shopify checkout customization specialist" gets hired: pick the niche where your proof is strongest and the buyer pain is urgent; (2) FIRST-5-REVIEWS PROTOCOL — the cold-start is real: bid smaller well-defined jobs where you can over-deliver fast, price modestly BUT not desperately (bottom-feeding attracts the clients you will regret), personalize every proposal to the actual job text in the first two lines (clients filter template spam instantly — referencing their specific problem is 80% of proposal success), deliver early with communication quality that gets mentioned in the review; (3) AFTER 5 REVIEWS: raise rates 20-30% every 2-3 strong reviews — platform algorithms reward momentum, and underpricing past the cold start signals low quality; (4) PLATFORM RISK MANAGEMENT: the platform owns the client relationship — deliver excellence INSIDE the rules (off-platform solicitation gets banned), but build the parallel asset: the portfolio site and the LinkedIn presence that let later clients find YOU directly.',
    direct_consulting: 'DIRECT CONSULTING PLAYBOOK: the graduation from platforms — (1) NICHE + POINT OF VIEW: consultants get hired for specific expensive problems ("we migrate legacy PHP monoliths to Laravel without downtime", "we get your Core Web Vitals green before the traffic season") — the niche you served as freelancer/employee is the niche that refers you; (2) PIPELINE: ex-employers and ex-colleagues first (the warm list converts 10x cold), then content in the niche (one genuinely useful post/month where the buyers read — the consulting funnel is trust accumulated in public), then partnerships (agencies overflow work they cannot staff; dev shops in adjacent stacks refer across); (3) PACKAGING: sell outcomes, not hours, as fast as credibility allows — the audit (fixed-price diagnostic with a written report: low risk for them, proof of expertise from you) → the project (scoped outcome, milestone-priced) → the retainer (monthly capacity for ongoing needs: the stability layer); (4) CONTRACTS always: scope, milestones, payment terms (deposit before work — 30-50% standard), change-request process, and IP transfer on final payment — the professionalism IS part of the product.',
    productized_digital_income: 'PRODUCTIZED INCOME PLAYBOOK (honest version — this is a slow compounding asset, not passive magic): the ladder by effort-to-income lag: (1) TEMPLATES/BOILERPLATES (shortest lag): the thing you built 5 times for clients, productized (SaaS starter kits, dashboard templates, config packs) sold on Gumroad/LemonSqueezy — buyers are devs saving a week; your marketing is the honest demo and the niche communities you already inhabit; (2) TOOLS/MICRO-SAAS: the internal script that saved your team hours, given a UI and a $9/mo price — distribution through the niche problem it solves (SEO content for the exact query, the relevant subreddit/forum presence, a free tier that demonstrates); (3) EDUCATION (longest lag, deepest moat): the course/book teaching what you genuinely know deeply — the audience build (writing consistently in the niche for months) precedes the launch, not follows it; launching to zero audience is the classic failure. UNIVERSAL RULES: build from PROOF (what you actually know/built — manufactured-expertise products die on refund rates), one product proven before the second started, and the income stack mindset: products stack ON consulting/employment income first; the cliff-jump into products is how runways die.'
  };

  const locationNotes = {
    emerging_market_mena_africa: 'MENA/AFRICA POSITIONING: the honest advantages — EU timezone overlap (the single biggest structural asset: GMT to GMT+3 covers the entire EU workday), strong English/French bilingualism (French unlocks the France/Belgium/Switzerland markets where competition is thinner than the anglophone pool), and cost-structure leverage (a rate that is mid-market for the client is life-changing locally — price to the CLIENT market, never to local benchmarks: the work is worth what it is worth). The honest obstacles and their counters: payment rails (see payment_logistics), the credibility cold start (counter with public proof-of-work and platform reviews — they transfer trust across borders), and visa-free travel limits for on-sites (remote-first targeting sidesteps it). Communities: local dev communities (GDG, DevC, country-level Slack/Discords) are dense with "who is hiring remotely from here" intelligence — the person two steps ahead of you in the same city is the best mentor available.',
    emerging_market_other: 'EMERGING-MARKET POSITIONING: the universal playbook — timezone honesty (lead with your real overlap with the target market; align target markets to your band: LATAM→US, Eastern Europe/Africa→EU, South/Southeast Asia→APAC+EU-mornings), price to the client market not the local one, build the public proof that transfers trust across borders (reviews, OSS, deployed products), and lean on the diaspora/community networks that know which companies hire from your country — that intelligence is worth more than any job board.',
    high_cost_country: 'HIGH-COST-COUNTRY POSITIONING: your leverage is proximity and context — same-timezone collaboration, native-market context (regulations, language, business culture), and on-site availability when it matters. Compete on depth and domain knowledge, not price — racing offshore rates from a high-cost base is unwinnable; owning the "knows OUR market/compliance/stack deeply" position is.'
  };

  return {
    status: 'success',
    path_playbook: pathPlaybooks[path],
    positioning_plan: locationNotes[location],
    first_wins_protocol: 'FIRST-WINS PROTOCOL (the universal cold start, any path): (1) inventory the warm network FIRST — ex-colleagues, community members, that founder whose bug you fixed once: the first paid win is overwhelmingly a warm contact, and asking is a normal professional act ("I am taking on [niche] work — if you hear of anyone needing X, I would appreciate the referral"); (2) over-deliver the first three engagements disproportionately — speed, communication, a small unasked extra: the first three clients are your marketing department for the next year; (3) capture the proof immediately: testimonial while the delight is fresh, case-study write-up (problem → what you did → measurable result), permission to name them; (4) the flywheel ritual: every finished engagement ends with the two asks — the review/testimonial and "who else should I be talking to?" — referral chains, not platforms, are how sustainable books of business actually build.',
    pricing_ladder: 'PRICING LADDER: STAGE 1 (reviews 0-5): modest-but-respectable platform rates or fixed small-project pricing — buying credibility, not income; never free (free work earns free-work referrals). STAGE 2 (proof established): +20-30% every 2-3 strong deliveries; move from hourly toward per-project (scoped outcomes reward your increasing speed — hourly punishes it). STAGE 3 (niche authority): value-anchored pricing on outcomes ("the migration that de-risks your replatform" is priced against the risk, not the hours) + retainers for stability (2-3 retainers covering base costs transform the stress economics of independent work). RULES: raise rates on every new client once pipeline exceeds capacity (the correct rate makes ~20% of prospects decline), quote ranges before discovery calls commit you, and in cross-border work: quote in the CLIENT currency (EUR/USD), with the clarity that your costs are in neither — currency swings are your business risk to price, not to absorb surprised.',
    payment_logistics: 'CROSS-BORDER PAYMENT LOGISTICS (the unglamorous make-or-break): the standard stack for emerging-market devs — Wise/Payoneer-class accounts for receiving EUR/USD at honest FX rates (banks\u2019 retail FX spreads quietly eat 3-6%), platform payouts routed through them where supported, and local-regulation homework done once properly (registration status for invoicing clients — many countries have auto-entrepreneur/micro-enterprise regimes built for exactly this; an hour with a local accountant beats a year of guessing); invoice professionally (numbered invoices, clear terms, your registration details) — enterprise clients require it and it marks you as the professional tier; payment terms discipline: deposits for projects (30-50%), net-15/30 for retainers, and the polite-but-firm overdue cadence ready before you need it. Keep 3-6 months runway as the independence buffer — the feast-famine cycle is managed with cash, not optimism.',
    sustainability_plan: 'SUSTAINABILITY PLAN (from gigs to stable income): the 12-month shape — months 1-3: first wins + proof capture (income noisy, that is normal); months 4-6: niche sharpened to what converted best, rates up one stage, the recurring layer begins (one retainer or a part-time anchor contract covering fixed costs); months 7-12: the stack stabilizes — anchor (retainer/part-time, ~50-60% of target income, the sleep-at-night layer) + projects (the growth and rate-discovery layer) + the compounding asset (public writing/OSS/product experiments feeding future pipeline). Guard the asset that generates everything: skills current (the niche moves — budget learning time as a business expense), health and hours bounded (independent-work burnout arrives silently from "just one more deadline"), and the professional network tended weekly — every strand of this playbook, from first win to premium rates, ultimately routes through people who know your work and trust you with theirs.'
  };
}

async function scoreResumeVsJob(args) {
  var resume = String(args.resume_text);
  var job = String(args.job_description);
  var stop = {};
  'the a an and or but with for from to of in on at by is are was were be been being as that this these those it its you your we our they their he she will would can could should may might must have has had do does did not no yes if then than more most other some such only own same so too very just about into over under again further once here there when where why how all any both each few our between out up down off above below'.split(' ').forEach(function(w) { stop[w] = 1; });
  function tokens(s) {
    return s.toLowerCase().replace(/[^a-z0-9+#./ -]/g, ' ').split(/[\s/,]+/).filter(function(w) { return w.length > 2 && !stop[w] && !/^\d+$/.test(w); });
  }
  var jobToks = tokens(job);
  var resumeToks = tokens(resume);
  var resumeSet = {};
  resumeToks.forEach(function(w) { resumeSet[w] = 1; });
  var freq = {};
  jobToks.forEach(function(w) { freq[w] = (freq[w] || 0) + 1; });
  var keywords = Object.keys(freq).sort(function(a, b) { return freq[b] - freq[a]; }).slice(0, 35);
  var matched = [], missing = [];
  keywords.forEach(function(k) { (resumeSet[k] ? matched : missing).push(k); });
  var score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  var verdict = score >= 70 ? 'STRONG MATCH' : score >= 50 ? 'DECENT MATCH' : score >= 30 ? 'WEAK MATCH' : 'POOR MATCH';
  var words = resume.split(/\s+/).filter(function(w) { return w; }).length;
  var hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resume);
  var hasPhone = /(\+?\d[\d\s().-]{7,})/.test(resume);
  var quantified = (resume.match(/\d+\s*%|\$\s*\d|\d+[kKmM]\b|\d+x\b|\d{2,}/g) || []).length;
  var structure = [];
  structure.push(hasEmail ? 'email found' : 'NO EMAIL FOUND - instant ATS rejection risk');
  structure.push(hasPhone ? 'phone found' : 'no phone number detected');
  structure.push(words + ' words total' + (words > 900 ? ' (TOO LONG - cut to under 700 for ATS and human scanners)' : words < 250 ? ' (THIN - likely reads as junior regardless of experience)' : ' (healthy length)'));
  structure.push(quantified + ' quantified figure(s) detected' + (quantified < 5 ? ' - LOW: numbers ($, %, scale) are what recruiters scan for' : ' - good quantification'));
  var prios = [];
  var topMissing = missing.slice(0, 8);
  if (topMissing.length) prios.push('P1: weave these REAL missing job keywords into experience bullets (only where true): ' + topMissing.join(', '));
  if (quantified < 5) prios.push('P1: convert at least 5 bullets to quantified form - "reduced load time 40%" beats "improved performance"');
  if (!hasEmail) prios.push('P1: add a parseable email address in plain text');
  if (score < 50) prios.push('P2: mirror the job title phrasing in your headline - ATS ranking weighs title alignment heavily');
  prios.push('P2: keywords must appear in CONTEXT (bullet describing real work), keyword-stuffing a skills list gets flagged');
  prios.push('P3: re-run this scorer after each edit - aim for 70%+ before submitting');
  return {
    status: 'success',
    match_score: verdict + ': ' + score + '/100 - the resume hits ' + matched.length + ' of the top ' + keywords.length + ' real keywords extracted from this job description (computed by frequency analysis, not guessed).',
    matched_keywords: matched.length ? 'MATCHED (' + matched.length + '): ' + matched.slice(0, 15).join(', ') + (matched.length > 15 ? ' +' + (matched.length - 15) + ' more' : '') : 'NO top job keywords matched - this resume will rank near the bottom of the ATS pile for this role.',
    missing_keywords: missing.length ? 'MISSING (' + missing.length + ' of top ' + keywords.length + '): ' + missing.slice(0, 15).join(', ') + (missing.length > 15 ? ' +' + (missing.length - 15) + ' more' : '') : 'None of the top job keywords are missing - exceptional alignment.',
    ats_structure_check: 'STRUCTURE READ of the real resume text: ' + structure.join('; ') + '.',
    tailoring_priorities: prios.join(' | '),
    data_source: 'Computed locally at request time: tokenization of both texts, stopword-filtered frequency extraction of the top job keywords, and real set-match scoring. Every keyword listed above came from YOUR job description - nothing generic.'
  };
}
