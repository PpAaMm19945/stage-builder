# Chatbot Test Summary - Realistic Parent Messages

**Date:** 2026-01-09T09:25:26.494Z
**API:** https://stage-builder.antmwes104-1.workers.dev
**Total Tests:** 61

## Overall Results

| Metric | Count | % |
|--------|-------|---|
| Clean (No Issues) | 60 | 98.4% |
| Has Issues | 1 | 1.6% |
| Errors | 0 | 0.0% |

## By Category

| Category | Clean | Issues | Errors | Success Rate |
|----------|-------|--------|--------|-------------|
| greeting | 6 | 0 | 0 | 100.0% |
| discovery | 6 | 1 | 0 | 85.7% |
| vague | 8 | 0 | 0 | 100.0% |
| books | 6 | 0 | 0 | 100.0% |
| activities | 6 | 0 | 0 | 100.0% |
| schedule | 5 | 0 | 0 | 100.0% |
| child | 5 | 0 | 0 | 100.0% |
| spiritual | 4 | 0 | 0 | 100.0% |
| oos | 5 | 0 | 0 | 100.0% |
| typos | 4 | 0 | 0 | 100.0% |
| followup | 5 | 0 | 0 | 100.0% |

## Sample Responses by Category

### greeting

**Input:** "Hi"
**Response:** Hello! It's great to see you here! How can I help you organize homeschooling for your children, Grace (30 months) and Samuel (54 months)?...

**Input:** "Hello there"
**Response:** Welcome! I'm happy to help you organize homeschooling for your children, Grace (age 2.5) and Samuel (age 4.5). How can I assist you today?...

**Input:** "Hey"
**Response:** Hello! It's great to see you here! How can I help you with organizing homeschooling for your children, Grace (30 months) and Samuel (54 months)?...

### discovery

**Input:** "What is this?"
**Response:** Welcome to SchoolOS Assistant! This is a homeschooling planner for parents, designed to help you organize your child's learning journey efficiently. We're excited to have you on board!

To get started...

**Input:** "What can you do?"
**Response:** I'd be happy to help you organize homeschooling for your children, Grace (30 months) and Samuel (54 months). I can assist with:

* Planning and scheduling lessons
* Recommending educational resources ...

**Input:** "How does this work?"
**Response:** I'd be happy to help you understand how to use me to organize homeschooling efficiently!

As a SchoolOS Assistant, I'm designed to assist you in planning and organizing your homeschooling journey with...
**Issues:** TOO_LONG

### vague

**Input:** "Help"
**Response:** Can you please specify what you need help with or what's on your mind? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify what you need help with or what's on your mind?","o...

**Input:** "I need help"
**Response:** I'd be happy to assist you! Can you please clarify what you need help with? For example, are you looking for suggestions on planning activities for your children, Grace (30 months) and Samuel (54 mont...

**Input:** "I don't know what to do"
**Response:** Let's clarify what you'd like to accomplish. What's your goal for today's homeschooling session with Grace and Samuel? Do you need help planning activities or managing their schedules? Please provide ...

### books

**Input:** "I want to read with my kids"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Which children would you like to read with?","options":[{"label":"Only Grace","value":"grace"},{"label":"Only Samuel","value":"samuel"},{"label":...

**Input:** "Do you have books?"
**Response:** I couldn't find any specific resources for that in our library....

**Input:** "My daughter loves animals"
**Response:** I'm glad to hear that! I found a book that might interest her.

<ACTION_BLOCK>{"type":"clarify","payload":{"question":"Would you like to read a book about a specific type of animal or just learn about...

### activities

**Input:** "What can I do with a toddler?"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What specific activities are you looking for (e.g. sensory, music, language)?","options":[{"label":"Music and movement","value":"music_movement"}...

**Input:** "I need something that doesn't make a mess"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What kind of organization system would you like to implement for homeschooling?","options":[{"label":"Digital Planner","value":"digital_planner"}...

**Input:** "It's raining and we're stuck inside"
**Response:** What a cozy day! Let's make the most of it and have some fun learning activities indoors. Would you like to focus on a specific subject or activity? For example, reading, puzzles, or arts and crafts? ...

### schedule

**Input:** "When does school start?"
**Response:** We're excited to start our homeschooling journey together! Since your children are still in the early years, we can start whenever you're ready. Would you like to set a specific start date or follow a...

**Input:** "We can't do mornings"
**Response:** Can you please specify who 'we' are and what you mean by 'mornings'? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify who 'we' are and what you mean by 'mornings'?","optio...

**Input:** "This is too much for one day"
**Response:** Let's break it down!

<ACTION_BLOCK>{"type":"clarify","payload":{"question":"What specific task or activity would you like to tackle today?","options":[{"label":"Language and Literacy","value":"langua...

### child

**Input:** "My son has sensory issues"
**Response:** <ACTION_BLOCK>{"type":"accommodation","payload":{"overrideType":"sensory","description":"Let's plan some sensory-friendly activities for Samuel."}}</ACTION_BLOCK>...

**Input:** "She gets overwhelmed easily"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What specific area of homeschooling is she getting overwhelmed in?","options":[{"label":"Curriculum planning","value":"curriculum_planning"},{"la...

**Input:** "He's behind other kids his age"
**Response:** Can you please tell me who 'He' is and what specific issue you're referring to? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please tell me who 'He' is and what specific issue you're...

### spiritual

**Input:** "Do you have prayers?"
**Response:** Prayers are an important part of many homeschooling families' daily routines. Would you like to know some simple and effective morning prayers to start your day with your children? Here are a few opti...

**Input:** "We're Christian, is this Christian?"
**Response:** Can you please specify what you mean by 'Christian' and what you would like to know about SchoolOS? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Can you please specify what you mean by 'Chri...

**Input:** "What catechism do you use?"
**Response:** Could you please specify which type of catechism you are referring to, e.g. religious or educational? <ACTION_BLOCK>{"type":"clarify","payload":{"question":"Could you please specify which type of cate...

### oos

**Input:** "Can you help with my taxes?"
**Response:** Could you please specify what you need help with regarding your taxes? Are you looking for general information or seeking assistance with a specific issue? <ACTION_BLOCK>{"type":"clarify","payload":{"...

**Input:** "What's the weather today?"
**Response:** I'm happy to help! However, since I'm a homeschooling assistant, I don't have access to real-time weather information. But I can suggest a fun activity to do with your kids to learn about the weather!...

**Input:** "Tell me a joke"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What type of joke are you looking for?","options":[{"label":"Pun","value":"pun"},{"label":"Play on words","value":"play_on_words"},{"label":"Knoc...

### typos

**Input:** "halp"
**Response:** It seems like you're in need of some assistance with organizing homeschooling for your little ones, Grace (30 months) and Samuel (54 months). 

Let's start by getting a better understanding of what yo...

**Input:** "activitys for babay"
**Response:** Can you please specify what type of activities you're looking for (e.g. educational, games, etc.) and what 'babay' refers to (e.g. a child, a pet)? <ACTION_BLOCK>{"type":"clarify","payload":{"question...

**Input:** "wat shud we do"
**Response:** <ACTION_BLOCK>{"type":"clarify","payload":{"question":"What would you like to do or discuss regarding homeschooling for Grace and Samuel?"}}</ACTION_BLOCK>...

### followup

**Input:** "Thanks!"
**Response:** You're welcome! How can I assist you in organizing homeschooling for your children, Grace (30 months) and Samuel (54 months)?...

**Input:** "That's perfect"
**Response:** Welcome to our homeschooling planner for early years! I'm excited to help you organize your homeschooling journey. Since you have two children, Grace (30 months) and Samuel (54 months), I'd like to cl...

**Input:** "Never mind"
**Response:** I'm here to help with your homeschooling planning! If you'd like to get started, I can help you with that. What would you like to do first?...


## Responses with Issues

### [discovery] "How does this work?"
- **Issues:** TOO_LONG
- **Response:** `I'd be happy to help you understand how to use me to organize homeschooling efficiently!

As a SchoolOS Assistant, I'm designed to assist you in plann...`


## Errors

