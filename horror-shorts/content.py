"""
MASTER CONTENT CONFIG — "DARK FREQUENCY" horror Shorts series (5 episodes)
Single source of truth for: scripts, on-screen text, sound design, captions,
descriptions, hashtags, tags, thumbnails and the render pipeline.
Channel voice: calm, low, documentary-dread. English.
"""

CHANNEL = "Dark Frequency"
SERIES_NOTE = "Weekly horror facts that are 100% documented. No jump-scare spam. No gore."

VIDEOS = [
    # ============================================================ EPISODE 1
    dict(
        id="v1",
        slug="brain-lies",
        title="3 Things Your Brain Does That Shouldn't Be Possible 🧠",
        hook_on_screen=["YOUR BRAIN", "IS LYING TO YOU"],
        thumbnail_text=["YOUR BRAIN", "IS LYING"],
        thumbnail_badge="3 FACTS",
        segments=[
            dict(key="hook", image="v1_01_hook.png", move="push_in",
                 on_screen=["YOUR BRAIN IS LYING TO YOU"],
                 narration="Your brain is lying to you right now. Three things it does that should not be possible. Number three will change how you sleep."),
            dict(key="f1", image="v1_02_thirdman.png", move="pan_up",
                 on_screen=["#1 THE THIRD MAN FACTOR"],
                 narration="One. The third man factor. Lost climbers and solo sailors report a presence walking beside them. A voice that says: turn left, now. Shackleton swore a fourth companion crossed Antarctica with him. It's your brain, splitting itself to keep you alive."),
            dict(key="f2", image="v1_03_uncanny.png", move="push_out",
                 on_screen=["#2 THE UNCANNY VALLEY"],
                 narration="Two. The uncanny valley. Things that look almost human make your skin crawl. Evolution builds disgust for one reason. For two hundred thousand years... something looked like us. And wasn't."),
            dict(key="f3", image="v1_04_void.png", move="push_in_fast",
                 on_screen=["#3 THE CALL OF THE VOID"],
                 narration="Three. The call of the void. On a ledge, your body urges you to jump. It's not a death wish. It's your survival system screaming, and your mind misreads it as desire. Your brain rehearses your death. Every day."),
            dict(key="cta", image="v1_01_hook.png", move="push_in",
                 on_screen=["FOLLOW FOR PART 2"],
                 narration="Follow. Part two is about what it does while you sleep."),
        ],
        caption="Your brain rehearses your death every single day. Fact #3 will change how you stand on balconies. 😳 Follow for Part 2. #horror #scaryfacts #creepy",
        description=(
            "Your brain is lying to you right now — and it's doing it to keep you alive.\n\n"
            "In this episode of Dark Frequency:\n"
            "0:00 The lie\n"
            "0:04 #1 The Third Man Factor — the unseen companion that saves dying explorers\n"
            "0:22 #2 The Uncanny Valley — why almost-human things revolt us\n"
            "0:35 #3 The Call of the Void (l'appel du vide) — the urge to jump\n\n"
            "The Third Man Factor is documented in survivors of extreme expeditions, including Ernest Shackleton's "
            "1914 Antarctic crossing and solo climbers in death zones. The uncanny valley effect was named by Masahiro "
            "Mori in 1970; evolutionary theories link the revulsion response to predator and corpse avoidance. "
            "The call of the void was studied by Jennifer Hames and colleagues (2012), who found it occurs most in "
            "people with HIGH survival instinct — it is a misread alarm, not a wish.\n\n"
            "⚠️ Educational horror. If intrusive thoughts about self-harm are persistent and distressing, please talk "
            "to a professional — the 'call of the void' in this video is the brief, universal phenomenon, not suicidal ideation.\n\n"
            "New horror facts every week. Subscribe and turn the bell on — Part 2 is about what your brain does while you sleep."
        ),
        hashtags=["#horror", "#scaryfacts", "#creepy", "#uncannyvalley", "#psychology", "#thirdmanfactor",
                  "#callofthevoid", "#darkfacts", "#horrorshorts", "#scarystories", "#creepyfacts", "#mystery",
                  "#unsettling", "#shorts"],
        tags="horror, scary facts, creepy facts, uncanny valley, third man factor, call of the void, psychology horror, dark facts, unsettling facts, horror shorts, youtube shorts, creepy, mystery, unexplained, dark frequency, scary stories, true horror, educational horror",
        pinned_comment="Which one hit hardest? 1, 2 or 3? I'm doing Part 2 on sleep — comment 'SLEEP' and I'll pin you. 👁️",
        sources=["Shackleton, South (1919) — 'third man' account", "Mori, M. (1970) — The Uncanny Valley",
                 "Hames et al. (2012) — 'High Place Phenomenon' study, Journal of Experimental Psychology"],
        sfx=dict(hook="boom", bed="drone_low", accent="heartbeat", end="riser_down"),
    ),
    # ============================================================ EPISODE 2
    dict(
        id="v2",
        slug="sounds-science-cant-explain",
        title="3 Sounds Science Still Can't Explain 📻",
        hook_on_screen=["THIS SOUND HAS PLAYED", "FOR 40 YEARS"],
        thumbnail_text=["THE BUZZER", "NEVER STOPS"],
        thumbnail_badge="REAL AUDIO",
        segments=[
            dict(key="hook", image="v2_01_hook_radio.png", move="push_in",
                 on_screen=["THIS SOUND HAS PLAYED FOR 40 YEARS"],
                 narration="This sound has been broadcasting for forty years. Nobody knows who is sending it. Three sounds science cannot explain."),
            dict(key="f1", image="v2_02_buzzer.png", move="pan_down",
                 on_screen=["#1 THE BUZZER — UVB-76"],
                 narration="One. The Buzzer. A Russian shortwave station, buzzing since the seventies. Sometimes it stops, and a voice reads names and numbers. In twenty-ten it went completely silent for weeks. Then it came back. And someone was still counting."),
            dict(key="f2", image="v2_03_hum.png", move="push_out",
                 on_screen=["#2 THE TAOS HUM"],
                 narration="Two. The Taos Hum. In one town in New Mexico, two percent of people hear a low diesel engine that isn't there. Only indoors. Only at night. Microphones have never caught it. Their brains, or something else, is generating it."),
            dict(key="f3", image="v2_04_infrasound.png", move="push_in_fast",
                 on_screen=["#3 THE FEAR FREQUENCY"],
                 narration="Three. The fear frequency. Engineer Vic Tandy felt dread and saw a grey shape in his lab. He measured the room: infrasound at eighteen point nine eight hertz. The same frequency that makes your eyeball vibrate. Hauntings, it turns out, can be a fan."),
            dict(key="cta", image="v2_01_hook_radio.png", move="push_in",
                 on_screen=["HEADPHONES ON. FOLLOW."],
                 narration="Put your headphones on and follow. Part two hums back."),
        ],
        caption="A radio station in Russia has been buzzing since the 1970s. Sometimes a voice interrupts it to count. Nobody knows who. 📻 #horror #uvb76 #creepysounds",
        description=(
            "Some sounds have no source. Some sources have no explanation.\n\n"
            "0:00 The broadcast\n"
            "0:05 #1 UVB-76 'The Buzzer' — the Russian shortwave ghost station\n"
            "0:24 #2 The Taos Hum — the town that hears an engine that isn't there\n"
            "0:40 #3 18.98 Hz — the infrasound 'fear frequency'\n\n"
            "UVB-76 (4625 kHz) has broadcast a monotone buzz since the late 1970s, occasionally interrupted by coded "
            "voice messages in Russian; its 2010 silence and return are documented by thousands of shortwave listeners. "
            "The Taos Hum affects roughly 2% of residents of Taos, New Mexico and has resisted every acoustic survey. "
            "Vic Tandy's 1998 paper 'The Ghost in the Machine' measured 18.98 Hz infrasound in a 'haunted' laboratory — "
            "the resonant frequency of the human eyeball — and Richard Wiseman later replicated haunted-space effects "
            "with infrasound in a Coventry cellar.\n\n"
            "🎧 Watch with headphones — the low end in this video is mixed to be felt, not heard.\n"
            "New horror facts every week. Subscribe — Part 2 is recorded at 3am."
        ),
        hashtags=["#horror", "#uvb76", "#thebuzzer", "#taoshum", "#infrasound", "#creepysounds", "#numbersstation",
                  "#unexplained", "#scaryfacts", "#horrorshorts", "#creepy", "#mystery", "#paranormal", "#shorts"],
        tags="uvb 76, the buzzer, numbers station, taos hum, infrasound, 18.98 hz, fear frequency, unexplained sounds, scary sounds, horror, creepy sounds, mystery, paranormal, horror shorts, youtube shorts, dark frequency, ghost in the machine, vic tandy",
        pinned_comment="Headphones on? 🔊 The hum in this video is mixed at 40Hz. Comment what you felt at 0:40.",
        sources=["Tandy, V. & Lawrence, T. (1998) — 'The Ghost in the Machine', JSIR",
                 "Wiseman et al. (2003) — Coventry cellar infrasound experiment",
                 "Arya et al. — Taos Hum acoustic surveys (1993-97)"],
        sfx=dict(hook="buzzer", bed="drone_radio", accent="hum", end="riser_down"),
    ),
    # ============================================================ EPISODE 3
    dict(
        id="v3",
        slug="while-you-sleep",
        title="3 Things That Can Happen To You While You Sleep 🛏️",
        hook_on_screen=["WHAT WAITS", "WHILE YOU SLEEP"],
        thumbnail_text=["DON'T FALL", "ASLEEP"],
        thumbnail_badge="TRUE",
        segments=[
            dict(key="hook", image="v3_01_hook_bed.png", move="push_in",
                 on_screen=["WHAT WAITS WHILE YOU SLEEP"],
                 narration="You will spend twenty-six years of your life asleep. Here is what is waiting in there with you."),
            dict(key="f1", image="v3_02_paralysis.png", move="pan_up",
                 on_screen=["#1 SLEEP PARALYSIS"],
                 narration="One. Sleep paralysis. Your body is chemically locked so you can't act out dreams. Sometimes your mind wakes first. You can't move, can't scream, and a shadow figure stands at the foot of the bed. Every culture on Earth reports the same visitor."),
            dict(key="f2", image="v3_03_insomnia.png", move="push_in_fast",
                 on_screen=["#2 FATAL FAMILIAL INSOMNIA"],
                 narration="Two. Fatal familial insomnia. One night, sleep simply stops coming. Not harder. Gone. A misfolded protein eats the part of your brain that lets you sleep. Eighteen months later, you die awake. There is no treatment. It is inherited."),
            dict(key="f3", image="v3_04_drop.png", move="push_out",
                 on_screen=["#3 THE DROP"],
                 narration="Three. The drop. That jolt right as you fall asleep, like falling from a height. Your muscles fire as your heart rate crashes. One theory: your brain thinks you're dying, and jolts you back. Every night, it considers letting you go."),
            dict(key="cta", image="v3_01_hook_bed.png", move="push_in",
                 on_screen=["FOLLOW — PT.2 TOMORROW"],
                 narration="Follow. Tomorrow: three places people walked into and never left."),
        ],
        caption="Every culture on Earth reports the SAME shadow figure at the foot of the bed. That's not a coincidence. That's biology. 😰 #horror #sleepparalysis #scaryfacts",
        description=(
            "You will spend 26 years of your life unconscious. This is what happens in there.\n\n"
            "0:00 Lights out\n"
            "0:05 #1 Sleep paralysis & the universal 'shadow visitor'\n"
            "0:26 #2 Fatal Familial Insomnia — the disease that deletes sleep\n"
            "0:43 #3 The hypnic jerk — 'the drop'\n\n"
            "Sleep paralysis occurs when REM atonia persists into waking; the 'intruder' hallucination (hat man, old hag, "
            "shadow person) is reported in nearly every culture, which is why researchers treat it as a hard-wired brain "
            "response. Fatal Familial Insomnia is a real inherited prion disease (first described in Italy, 1986) with a "
            "median survival of ~18 months and no cure. The hypnic jerk affects up to 70% of people; leading theories "
            "involve the brainstem misfiring as heart rate and temperature fall at sleep onset.\n\n"
            "⚠️ Educational horror. Occasional sleep paralysis is common and harmless. Chronic episodes deserve a sleep "
            "doctor, not a ghost hunt.\n\n"
            "Subscribe for tomorrow's episode: three places people walked into and never walked out."
        ),
        hashtags=["#horror", "#sleepparalysis", "#scaryfacts", "#nightmare", "#fatalinsomnia", "#hypnicjerk",
                  "#creepyfacts", "#horrorshorts", "#darkfacts", "#shadowpeople", "#scarystories", "#mystery",
                  "#sleep", "#shorts"],
        tags="sleep paralysis, shadow people, hat man, fatal familial insomnia, prion disease, hypnic jerk, the drop, nightmare facts, scary sleep facts, horror, creepy facts, dark facts, horror shorts, youtube shorts, dark frequency, sleep horror, true horror facts",
        pinned_comment="Have you ever seen the shadow figure? Describe it in one word. Mine: 'patient'. 🕯️",
        sources=["Cheyne et al. (1999) — sleep paralysis intruder hallucinations",
                 "Lugaresi et al. (1986) — first FFI family, NEJM", "NIH/NINDS — hypnic jerk overview"],
        sfx=dict(hook="boom", bed="drone_low", accent="heartbeat_slow", end="riser_down"),
    ),
    # ============================================================ EPISODE 4
    dict(
        id="v4",
        slug="never-walked-out",
        title="3 Places People Walked Into And Never Walked Out 🏔️",
        hook_on_screen=["THEY CUT THEIR WAY OUT", "OF THEIR OWN TENT"],
        thumbnail_text=["9 HIKERS.", "0 SURVIVORS."],
        thumbnail_badge="1959",
        segments=[
            dict(key="hook", image="v4_01_hook_tent.png", move="push_in",
                 on_screen=["THEY CUT THEIR WAY OUT OF THEIR OWN TENT"],
                 narration="Nine hikers cut their way out of their own tent, barefoot, in minus thirty degrees. Three places people entered and never left."),
            dict(key="f1", image="v4_02_dyatlov.png", move="pan_down",
                 on_screen=["#1 DYATLOV PASS, 1959"],
                 narration="One. Dyatlov Pass, nineteen fifty-nine. The tent was slashed from the inside. Nine bodies in the snow, some with crushed chests and no external wounds. One was missing her tongue. Their clothes carried radiation. The case was reopened in twenty-nineteen. Then quietly closed again."),
            dict(key="f2", image="v4_03_yuba.png", move="push_out",
                 on_screen=["#2 THE YUBA COUNTY FIVE"],
                 narration="Two. The Yuba County Five, nineteen seventy-eight. Five men abandoned a perfectly good car in a blizzard and walked into the forest. One was found months later in a shed, surrounded by food he never ate. He had starved anyway."),
            dict(key="f3", image="v4_04_bennington.png", move="push_in_fast",
                 on_screen=["#3 THE BENNINGTON TRIANGLE"],
                 narration="Three. The Bennington Triangle. Between nineteen forty-five and nineteen fifty, five people vanished within ten miles of one Vermont mountain. A search plane with ten people aboard disappeared looking for them. It was never found either."),
            dict(key="cta", image="v4_01_hook_tent.png", move="push_in",
                 on_screen=["FOLLOW — PT.2 GOES UNDERWATER"],
                 narration="Follow. Part two goes underwater."),
        ],
        caption="Their tent was slashed FROM THE INSIDE. Nine experienced hikers fled barefoot into -30°C. Nobody has ever explained why. 🏔️ #dyatlovpass #horror #truecrime",
        description=(
            "Three coordinates where people walked in — and history stopped recording them walking out.\n\n"
            "0:00 The tent\n"
            "0:06 #1 Dyatlov Pass incident, Ural Mountains, 1959\n"
            "0:30 #2 The Yuba County Five, California, 1978\n"
            "0:45 #3 The Bennington Triangle, Vermont, 1945-1950\n\n"
            "The Dyatlov Pass incident killed nine experienced skiers; the 2019-2021 Russian review concluded a slab "
            "avalanche, but injuries inconsistent with an avalanche and traces of radiation on clothing keep the case "
            "contested. The Yuba County Five (1978) remains one of America's strangest disappearances — a functioning car "
            "abandoned in a storm, and a survivor found in a mining shed surrounded by untouched food. The Bennington "
            "Triangle refers to five disappearances near Glastenbury Mountain, Vermont, including a search plane lost "
            "with ten aboard in 1950.\n\n"
            "⚠️ Respectful true-crime/horror storytelling about documented cases. Sources in the pinned comment.\n\n"
            "Subscribe — Part 2 goes underwater."
        ),
        hashtags=["#dyatlovpass", "#horror", "#truecrime", "#unexplained", "#missingpersons", "#yubacountyfive",
                  "#benningtontriangle", "#scaryfacts", "#mystery", "#horrorshorts", "#creepy", "#coldcase",
                  "#disappearance", "#shorts"],
        tags="dyatlov pass, yuba county five, bennington triangle, missing persons, unexplained disappearances, true crime, cold case, mystery, horror, scary facts, horror shorts, youtube shorts, dark frequency, 1959, vanished, unsolved",
        pinned_comment="Dyatlov: avalanche, military test, or something in the pass? Vote 1-2-3. I'll post the 1959 case file next week.",
        sources=["Russian Prosecutor's Office review (2019-2021)", "Kupriyanovich et al. (2021) — slab avalanche model, CPHEM",
                 "Yuba County Sheriff case files (1978)", "Vermont State Police records, Glastenbury (1945-50)"],
        sfx=dict(hook="boom_wind", bed="drone_wind", accent="heartbeat", end="riser_down"),
    ),
    # ============================================================ EPISODE 5
    dict(
        id="v5",
        slug="real-body-horror",
        title="3 Body Horror Facts That Are 100% Real 🧬",
        hook_on_screen=["THIS PROTEIN", "CANNOT BE KILLED"],
        thumbnail_text=["CANNOT", "BE KILLED"],
        thumbnail_badge="REAL",
        segments=[
            dict(key="hook", image="v5_01_hook_prion.png", move="push_in",
                 on_screen=["THIS PROTEIN CANNOT BE KILLED"],
                 narration="This protein cannot be killed. Not by boiling, bleach, or radiation. Three body horror facts that are completely real."),
            dict(key="f1", image="v5_02_lab.png", move="pan_up",
                 on_screen=["#1 PRIONS"],
                 narration="One. Prions. Not a virus, not a bacteria. A protein folded wrong, that teaches your proteins to fold wrong too. It survives autoclaves, formaldehyde, and incineration. It can sleep in your body for thirty years. Then it wakes up. One hundred percent fatal."),
            dict(key="f2", image="v5_03_rabies.png", move="push_out",
                 on_screen=["#2 RABIES"],
                 narration="Two. Rabies. Once symptoms start, it is almost always fatal. The virus rewires your brain to fear water, so you can't wash it off, and to bite, so it can travel. The scariest part isn't the virus. It's how well it knows your behaviour."),
            dict(key="f3", image="v5_04_cotard.png", move="push_in_fast",
                 on_screen=["#3 COTARD'S DELUSION"],
                 narration="Three. Cotard's delusion. People who are certain they are already dead. That their organs are rotting, that they don't need to eat. Brain scans show the face-recognition circuit disconnected from emotion. One patient asked to be taken to the cemetery. To feel at home."),
            dict(key="cta", image="v5_01_hook_prion.png", move="push_in",
                 on_screen=["FOLLOW — PT.3 IS YOUR HOUSE"],
                 narration="Follow. Part three is about your house."),
        ],
        caption="Prions survive boiling, bleach, radiation AND incineration. They can wait 30 years inside you. This is not sci-fi. 🧬 #horror #prion #bodyhorror",
        description=(
            "No monsters required. Biology wrote these.\n\n"
            "0:00 The unkillable\n"
            "0:06 #1 Prions — the protein that converts you\n"
            "0:30 #2 Rabies — the virus that knows your behaviour\n"
            "0:46 #3 Cotard's delusion — 'walking corpse syndrome'\n\n"
            "Prions are misfolded proteins that induce misfolding in normal proteins; they resist standard sterilisation "
            "(autoclaving at 134°C, formaldehyde, ionising radiation) and cause invariably fatal neurodegenerative disease "
            "with incubation periods of decades. Rabies has a case-fatality rate above 99% once symptoms begin; hydrophobia "
            "and aggression are direct results of the virus targeting limbic circuits. Cotard's delusion ('walking corpse "
            "syndrome') is a documented neuropsychiatric condition linked to disrupted face/emotion processing; PET studies "
            "have shown reduced metabolic activity in frontal and parietal regions of affected patients.\n\n"
            "⚠️ Medical topics presented for education. Rabies is preventable with prompt post-exposure vaccination — "
            "if bitten by an unknown animal, go to a hospital the same day.\n\n"
            "Subscribe — Part 3 is about the house you're sitting in right now."
        ),
        hashtags=["#horror", "#prion", "#bodyhorror", "#rabies", "#cotardsdelusion", "#scaryfacts", "#medicalhorror",
                  "#creepyfacts", "#darkfacts", "#horrorshorts", "#biology", "#mystery", "#unsettling", "#shorts"],
        tags="prion, prion disease, rabies, cotard delusion, walking corpse syndrome, body horror, medical horror, scary biology facts, dark facts, creepy facts, horror, horror shorts, youtube shorts, dark frequency, true horror facts, unsettling",
        pinned_comment="Part 3 is about your house. Comment 'HOUSE' if you want it tomorrow. 🏚️",
        sources=["WHO — prion decontamination guidelines", "CDC — rabies case-fatality data",
                 "Charland-Verville et al. (2013) — PET study of a Cotard's patient, Cortex"],
        sfx=dict(hook="boom", bed="drone_low", accent="geiger", end="riser_down"),
    ),
]

# ---------------- posting plan (Asia/Kuala_Lumpur, MY audience + US overlap) ----
POSTING_PLAN = [
    ("Episode 1", "Mon", "21:00 MYT", "Peak MY evening scroll; US East morning"),
    ("Episode 2", "Wed", "23:00 MYT", "Late-night horror mindset; US lunch"),
    ("Episode 3", "Fri", "00:30 MYT", "'Can't sleep' content at bedtime = max relevance"),
    ("Episode 4", "Sat", "21:00 MYT", "Weekend true-crime binge window"),
    ("Episode 5", "Sun", "22:00 MYT", "Sunday-night doomscroll; sets up Part 3 Mon"),
]

RETENTION_RULES = [
    "First frame must be the creepiest frame — Shorts autoplay muted in feed; the ON-SCREEN HOOK TEXT does the work of audio.",
    "Never open with a logo, intro or 'hey guys'. Frame 1 = the claim.",
    "Cut every 1.5-3s (this render cuts at every segment + adds push/pan motion so the frame never sits still).",
    "Number the facts on screen (#1 #2 #3) — viewers stay to close the loop.",
    "Tease #3 inside the hook ('number three will change how you sleep') — a promise = retention.",
    "End on a promise for the NEXT video, not 'like and subscribe'. Follow-through beats follows.",
    "Loop trick: last line + first line should read as one sentence when the Short replays.",
]
