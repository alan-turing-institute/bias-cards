# Tutorial Development Notes

## Activity Details
- **Title:** AI-Powered Diagnostic Assistant for Emergency Departments
- **Description:** An ML system to assist emergency department staff in patient triage and preliminary diagnosis
- **Domain:** Healthcare/Medical AI
- **Date:** 2025-08-07

## Stage 1: Risk Assessment Notes

### Biases to Categorise

**High Risk:**
- Decision-Automation Bias - Healthcare professionals over-relying on AI without clinical judgement
- Implementation Bias - Poor integration into ED workflows
- Missing Data Bias - Poor performance on underrepresented populations
- Training-Serving Skew - Differences between training and real-world emergency data

**Medium Risk:**
- Confirmation Bias - Team seeking supportive data during analysis
- Chronological Bias - Historical treatment changes not accounted for
- Label Bias - Subjective measures varying across demographics
- Selection Bias - Only seeing ED patients, missing other care pathways

**Low Risk:**
- Status Quo Bias - Resistance to changing procedures
- Automation-Distrust Bias - Clinicians ignoring helpful suggestions
- Optimism Bias - Team focusing only on positive results

### Screenshots Needed:
1. Initial view of Stage 1
2. Dragging first bias to high risk
3. Mid-process with some cards categorised
4. Completed categorisation
5. Stage completion confirmation

---

## Stage 2: Lifecycle Assignment Notes

### Mapping Strategy:
- Project Planning: Implementation Bias, Status Quo Bias
- Problem Formulation: Confirmation Bias, Selection Bias  
- Data Extraction: Missing Data Bias, Chronological Bias
- Data Analysis: Label Bias, Confirmation Bias
- Model Selection/Training: Training-Serving Skew
- System Implementation: Decision-Automation Bias, Implementation Bias
- System Use & Monitoring: Automation-Distrust Bias, Decision-Automation Bias

### Screenshots Needed:
1. Initial view with categorised cards
2. Card drawer open
3. Project Design tab with cards
4. Model Development tab with cards
5. System Deployment tab with cards
6. Completed stage overview

---

## Stage 3: Rationale Documentation Notes

### Key Rationales to Document:
- **Decision-Automation Bias:** "Critical risk in emergency settings where time pressure may lead clinicians to accept AI recommendations without proper verification, potentially missing important clinical context"
- **Missing Data Bias:** "Emergency department sees primarily acute cases; model lacks exposure to patients who self-manage or visit GPs, creating gaps in diagnostic coverage"
- **Implementation Bias:** "Integration challenges with existing ED systems and workflows could lead to workarounds that compromise both efficiency and safety"

### Screenshots Needed:
1. Initial view of mapped biases
2. Opening card details modal
3. Typing rationale
4. Multiple completed rationales
5. Stage completion

---

## Stage 4: Mitigation Selection Notes

### Mitigation Pairings:
- Decision-Automation Bias → Human-in-the-Loop + Skills and Training
- Implementation Bias → Participatory Design Workshops + Stakeholder Engagement
- Missing Data Bias → Additional Data Collection + Identify Underrepresented Groups
- Training-Serving Skew → Regular Auditing + External Validation

### Screenshots Needed:
1. Initial view of biases
2. Mitigation strategies drawer
3. Dragging mitigation to bias
4. Multiple pairings complete
5. Stage completion

---

## Stage 5: Implementation Planning Notes

### Timeline:
- **Immediate (Month 1):** Human-in-the-Loop protocols, Skills and Training
- **Short-term (Months 2-3):** Participatory Design Workshops
- **Medium-term (Months 4-6):** Additional Data Collection
- **Ongoing:** Regular Auditing and External Validation

### Screenshots Needed:
1. Initial planning interface
2. Setting priorities
3. Responsibility assignments
4. Success metrics
5. Final roadmap

---

## User Experience Observations

### Stage 1 Observations:
- Drag-and-drop interface is intuitive with clear visual feedback
- Card library drawer provides good overview of all available biases
- Progress bar provides clear indication of minimum requirements (10 cards)
- Risk categories are well-defined with helpful descriptions
- Cards can be moved between categories if reassessment needed

### Key UI Elements:
- Stage navigation pills at top show progress through 5 stages
- "View All Bias Cards" button opens comprehensive library
- Each risk category has distinct colour coding for visual clarity
- Cards display number, icon, title, and brief description
- Footer provides persistent "Complete Stage" button

## Tips for Tutorial

### General Tips:
1. **Start with high-risk biases** - These have the most significant impact
2. **Use the search function** in the card library to find specific biases quickly
3. **Consider your specific context** - A bias that's high-risk for one project may be low-risk for another
4. **Don't rush** - Take time to read each bias description carefully
5. **Collaborate** - Use the "Needs Discussion" category for uncertain cases

### Stage-Specific Tips:

**Stage 1 - Risk Assessment:**
- Minimum 10 cards must be categorised to proceed
- Think about your specific use case (e.g., emergency department context)
- Consider both technical and human factors

**Stage 2 - Lifecycle Assignment:**
- Cards from Stage 1 appear pre-filtered
- Multiple biases can affect the same lifecycle stage
- Think temporally - when will each bias most likely occur?

**Stage 3 - Rationale Documentation:**
- Be specific about why each bias matters for your project
- Include real examples from your domain
- This creates valuable documentation for audits

**Stage 4 - Mitigation Selection:**
- Focus on high-risk biases first
- Consider resource constraints when selecting strategies
- Some mitigations address multiple biases

**Stage 5 - Implementation Planning:**
- Set realistic timelines
- Assign clear responsibilities
- Define measurable success criteria