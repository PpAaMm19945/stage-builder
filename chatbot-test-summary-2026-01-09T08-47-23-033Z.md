# Chatbot Test Summary - Realistic Parent Messages

**Date:** 2026-01-09T08:47:23.036Z
**API:** https://stage-builder.antmwes104-1.workers.dev
**Total Tests:** 61

## Overall Results

| Metric | Count | % |
|--------|-------|---|
| Clean (No Issues) | 39 | 63.9% |
| Has Issues | 22 | 36.1% |
| Errors | 0 | 0.0% |

## By Category

| Category | Clean | Issues | Errors | Success Rate |
|----------|-------|--------|--------|-------------|
| greeting | 5 | 1 | 0 | 83.3% |
| discovery | 6 | 1 | 0 | 85.7% |
| vague | 2 | 6 | 0 | 25.0% |
| books | 5 | 1 | 0 | 83.3% |
| activities | 3 | 3 | 0 | 50.0% |
| schedule | 3 | 2 | 0 | 60.0% |
| child | 2 | 3 | 0 | 40.0% |
| spiritual | 3 | 1 | 0 | 75.0% |
| oos | 5 | 0 | 0 | 100.0% |
| typos | 1 | 3 | 0 | 25.0% |
| followup | 4 | 1 | 0 | 80.0% |

## Sample Responses by Category

### greeting

**Input:** "Hi"
**Response:** Hello! It's great to have you here. How can I assist you with organizing your homeschooling for Grace and Samuel today?...

**Input:** "Hello there"
**Response:** Hello! It's great to have you on our homeschooling planner! How can I assist you today?...

**Input:** "Hey"
**Response:** Hello! It's great to see you here! How can I help you with organizing homeschooling for your children, Grace and Samuel?...

### discovery

**Input:** "What is this?"
**Response:** Welcome to SchoolOS Assistant! This is a homeschooling planner for parents, designed to help you organize and streamline your homeschooling journey. I'm here to assist you in creating a personalized l...

**Input:** "What can you do?"
**Response:** I'd be happy to help you with homeschooling planning and organization. I can assist with creating schedules, tracking progress, and providing resources for early years education. What specific area wo...

**Input:** "How does this work?"
**Response:** Welcome to SchoolOS Assistant! I'm here to help you organize homeschooling for your children, Grace (30 months) and Samuel (54 months)....

### vague

**Input:** "Help"
**Response:** What do you need help with? (e.g., homework, finding a book, etc.) <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What do you need help with? (e.g., homework, finding a book, etc.)","options":...
**Issues:** UNEXPECTED_BLOCK

**Input:** "I need help"
**Response:** I'd be happy to assist you! However, I need a bit more information to provide the best support. Could you please clarify what you need help with, such as planning a specific activity or lesson for you...

**Input:** "I don't know what to do"
**Response:** Can you please tell me more about what's bothering you or what you're trying to accomplish? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please tell me more about what's bothering yo...
**Issues:** UNEXPECTED_BLOCK

### books

**Input:** "I want to read with my kids"
**Response:** Let's get started!

<ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of book are you looking for?","options":[{"label":"Picture book","value":"picture_book"},{"label":"Board book","val...

**Input:** "Do you have books?"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of books are you looking for? (e.g. educational, fiction, non-fiction)","options":[{"label":"Educational","value":"educational"},{"labe...

**Input:** "My daughter loves animals"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Which type of animal would you like to focus on?","options":[{"label":"Mammals","value":"mammals"},{"label":"Birds","value":"birds"},{"label":"Re...

### activities

**Input:** "What can I do with a toddler?"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What are you looking for to do with your toddler? (e.g., sensory play, outdoor activities, educational activities)","options":[{"label":"Sensory ...

**Input:** "I need something that doesn't make a mess"
**Response:** Could you please specify what type of resource or activity you're looking for that doesn't make a mess? (e.g. book, game, craft, etc.) <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Could you ...
**Issues:** UNEXPECTED_BLOCK

**Input:** "It's raining and we're stuck inside"
**Response:** What a cozy day! Let's plan some fun activities to keep the kids engaged. Which type of book would you like to read together today?...

### schedule

**Input:** "When does school start?"
**Response:** Welcome to our homeschooling planner!

<ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of school start schedule are you referring to?","options":[{"label":"Academic year","value":"aca...

**Input:** "We can't do mornings"
**Response:** Can you please specify what you mean by 'mornings'? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify what you mean by 'mornings'?","options":[{"label":"Clarify Rephrase","...
**Issues:** UNEXPECTED_BLOCK

**Input:** "This is too much for one day"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What specific area of homeschooling are you struggling with today?","options":[{"label":"Curriculum planning","value":"curriculum_planning"},{"la...

### child

**Input:** "My son has sensory issues"
**Response:** <ACTION_BLOCK>{"type":"accommodation","payload":{"overrideType":"sensory","description":"Let's discuss some accommodations for your son's sensory needs."}}</ACTION_BLOCK>...

**Input:** "She gets overwhelmed easily"
**Response:** I couldn't process that request. The message does not contain a clear request or question, and appears to be a statement rather than a question or command. Could you rephrase?...
**Issues:** UNEXPECTED_BLOCK

**Input:** "He's behind other kids his age"
**Response:** Can you please tell me more about what you mean by 'He's behind other kids his age'? Are you concerned about his academic performance, social skills, or something else? <ACTION_BLOCK>{"type":"clarify"...
**Issues:** UNEXPECTED_BLOCK

### spiritual

**Input:** "Do you have prayers?"
**Response:** What a wonderful question!

<ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of prayers are you looking for? Are you interested in morning prayers, bedtime prayers, or something else?"...

**Input:** "We're Christian, is this Christian?"
**Response:** Can you please specify what 'this' refers to, and what kind of Christian context you are interested in? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify what 'this' refers...
**Issues:** UNEXPECTED_BLOCK

**Input:** "What catechism do you use?"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What catechism are you referring to?","options":[{"label":"Christian","value":"christian_catechism"},{"label":"Other","value":"other_catechism"}]...

### oos

**Input:** "Can you help with my taxes?"
**Response:** I couldn't process that request. Taxes are not a school-related topic Could you rephrase?...

**Input:** "What's the weather today?"
**Response:** Hi! I'm happy to help you with that. However, I'm a homeschooling assistant, not a weather reporter. I don't have access to real-time weather information. But I can suggest you check your local news o...

**Input:** "Tell me a joke"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of joke are you looking for?","options":[{"label":"Pun","value":"pun"},{"label":"Knock-knock","value":"knock_knock"},{"label":"Other","...

### typos

**Input:** "halp"
**Response:** I couldn't process that request. The message contains gibberish and is not a valid request. Could you rephrase?...
**Issues:** UNEXPECTED_BLOCK

**Input:** "activitys for babay"
**Response:** What type of activities are you looking for (e.g. educational, fun, outdoor)? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of activities are you looking for (e.g. educational, fun,...
**Issues:** UNEXPECTED_BLOCK

**Input:** "wat shud we do"
**Response:** I couldn't process that request. The message contains gibberish and is unclear. Could you rephrase?...
**Issues:** UNEXPECTED_BLOCK

### followup

**Input:** "Thanks!"
**Response:** You're welcome!...
**Issues:** TOO_SHORT

**Input:** "That's perfect"
**Response:** Welcome to SchoolOS Assistant! How can I help you organize homeschooling for your children, Grace (30 months) and Samuel (54 months)?...

**Input:** "Never mind"
**Response:** No worries! It seems like you might have had a question or request, but didn't quite get it out. If you're ready to proceed, feel free to ask me anything or provide more context about what you'd like ...


## Responses with Issues

### [greeting] "Is anyone there?"
- **Issues:** TOO_SHORT
- **Response:** `Hello!...`

### [discovery] "Can you teach my kids?"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please specify what type of teaching you're looking for (e.g. language, math, art)? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can...`

### [vague] "Help"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `What do you need help with? (e.g., homework, finding a book, etc.) <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What do you need help with? ...`

### [vague] "I don't know what to do"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please tell me more about what's bothering you or what you're trying to accomplish? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can...`

### [vague] "My kid is bored"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please provide more information about what your kid is interested in? (e.g. subject, activity, etc.) <ACTION_BLOCK>{"type":"clarify","payload"...`

### [vague] "Everything is hard"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you tell me more about what you're finding hard? Is it related to school or something else? <ACTION_BLOCK>{"type":"clarify","payload":{"question":...`

### [vague] "This isn't working"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please specify what you mean by 'this' and what's not working as expected? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you plea...`

### [vague] "Ugh"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `I couldn't process that request. The message appears to be a single emotional expression and does not contain a specific request or question. Could yo...`

### [books] "He won't sit still for stories"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Who is 'he' and what type of stories are you trying to share with him? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Who is 'he' and what typ...`

### [activities] "I need something that doesn't make a mess"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Could you please specify what type of resource or activity you're looking for that doesn't make a mess? (e.g. book, game, craft, etc.) <ACTION_BLOCK>{...`

### [activities] "Something educational but fun"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Could you please specify what type of educational content you're looking for (e.g., book, video, game)? And what age group is it for? <ACTION_BLOCK>{"...`

### [activities] "He just wants to play with blocks all day"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please clarify who 'He' is and what you mean by 'play with blocks all day'? Are you looking for a suggestion or trying to express a concern? <...`

### [schedule] "We can't do mornings"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please specify what you mean by 'mornings'? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify what you mean by 'mo...`

### [schedule] "We want to take Fridays off"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Who would like to take Fridays off, and for what reason? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Who would like to take Fridays off, an...`

### [child] "She gets overwhelmed easily"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `I couldn't process that request. The message does not contain a clear request or question, and appears to be a statement rather than a question or com...`

### [child] "He's behind other kids his age"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please tell me more about what you mean by 'He's behind other kids his age'? Are you concerned about his academic performance, social skills, ...`

### [child] "She just turned 6"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `What would you like to do with this information? (e.g., find a birthday gift, plan a party, etc.) <ACTION_BLOCK>{"type":"clarify","payload":{"question...`

### [spiritual] "We're Christian, is this Christian?"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `Can you please specify what 'this' refers to, and what kind of Christian context you are interested in? <ACTION_BLOCK>{"type":"clarify","payload":{"qu...`

### [typos] "halp"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `I couldn't process that request. The message contains gibberish and is not a valid request. Could you rephrase?...`

### [typos] "activitys for babay"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `What type of activities are you looking for (e.g. educational, fun, outdoor)? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of acti...`

### [typos] "wat shud we do"
- **Issues:** UNEXPECTED_BLOCK
- **Response:** `I couldn't process that request. The message contains gibberish and is unclear. Could you rephrase?...`

### [followup] "Thanks!"
- **Issues:** TOO_SHORT
- **Response:** `You're welcome!...`


## Errors

