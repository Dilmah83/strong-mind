# Content research and review

Reviewed 2026-11-17. All original programme topics/actions/audio links in `src/programme.js` are unchanged from main commit `5877a80`. Added YouTube links are clearly labelled searches rather than invented episode URLs. The core morning routine remains 10 + 35 + 10 + 5 = 60 minutes; quotes and stories are optional.

## 100 quote excerpts

- Marcus Aurelius, *Meditations*, George Long translation (1862), books 2–12. [Internet Classics Archive](https://classics.mit.edu/Antoninus/meditations.html), [plain-text source](https://classics.mit.edu/Antoninus/meditations.mb.txt). Only the public-domain translation text is excerpted; website presentation is not reproduced.
- Epictetus, *Enchiridion*, George Long translation (1877). [Open Epictetus](https://jtauber.github.io/enchiridion/), [reference-aligned English text](https://raw.githubusercontent.com/jtauber/enchiridion/master/text/EN_long.txt). Project source credits the Perseus Digital Library. Numbered chapter/segment references match that edition.
- Long died in 1879. These historical translations are public domain; their original spelling and punctuation are retained, with whitespace normalised. Book/section and translation appear beside every excerpt. Modern interpretations, challenges and questions are original editorial text, not words attributed to the philosopher.
- `npm run verify:quotes` downloads the two source texts and verifies all 100 excerpts against the exact referenced book/section. It is an optional research check, not a network dependency of normal tests/builds. `MARCUS_SOURCE` and `EPICTETUS_SOURCE` can point to downloaded copies for offline verification.
- Quotes were reviewed to avoid unmarked dialogue/borrowed sayings being attributed to the wrong speaker. The archive labels short passages as excerpts. Historical discussions of health or agency are not medical claims.
- Seneca and Musonius Rufus were prioritised during research but are not included: commonly accessible modern English translations have jurisdiction-dependent copyright terms. The release uses two unambiguously old translations rather than inventing/modernising quotations or claiming all four philosophers are represented.

## Twenty stories

Each story in `src/stories.js` has separate factual summary, challenge, actions, documented outcome, editorial lesson, application and direct sources. First-party biographies and personal claims are explicitly labelled. No copied photos, articles or full interviews. Summaries are short original text, not quotations. Source pages were checked through web research; availability can change.

| Individual | Principal evidence | Important qualification |
|---|---|---|
| David Goggins | US Veterans Affairs; personal biography | Military qualifications documented; inner experience personal |
| James Clear | Own biography; Kara Goldin first-person interview | Injury/recovery narrative is personal testimony |
| Jocko Willink | Professional and publisher biographies | Leadership lessons reflect interpretation of service |
| Rich Roll | Own detailed biography | Recovery/transformation and race claims labelled first-party |
| James Stockdale | US Naval Academy; US Navy history | Survival not implied to be under individual control |
| Ernest Shackleton | Scott Polar Research Institute; Royal Museums Greenwich | All 28 refers to Endurance/Weddell Sea party, not Ross Sea party |
| Viktor Frankl | Viktor Frankl Institute biography | Survival of persecution never attributed to mindset alone |
| Terry Fox | Terry Fox Foundation timeline | Run ended with cancer recurrence; not a cure narrative |
| Malala Yousafzai | Nobel committee; United Nations | Advocacy includes care/allies and collective work |
| Nelson Mandela | Mandela Foundation archive | Transition was collective and politically complex |
| Wilma Rudolph | US Olympic & Paralympic Museum; women’s history museum | Individual recovery is not a prognosis for others |
| Eliud Kipchoge | Event organiser; Guinness record context | 1:59:40.2 special event was not an official marathon world record |
| Niki Lauda | Formula 1 historical account | 42-day return is not advice on recovery timelines |
| Simone Biles | Team USA; FIG yearbook 2024 | Health decision valid independently of later medals |
| Michael Phelps | University report; foundation biography | Asking for help compatible with achievement |
| Bethany Hamilton | First-person retrospective | Experience and adaptation labelled personal |
| Jessica Watson | Australian Sailing; contemporary ABC report | No ratified youngest/world-record claim |
| Turia Pitt | Own biography | Endurance and transformation claims labelled first-party |
| Chris Hadfield | Canadian Space Agency biography | Career preparation documented, not an invented adversity story |
| Roger Bannister | World Athletics heritage record | Coach/pacemakers acknowledged; not belief-only mythology |

The app includes the exact source URLs in every story. The optional five-minute practice can include reading the summary, reflecting or opening a source; external sources need connectivity.
