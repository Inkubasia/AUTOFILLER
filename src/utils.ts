import { faker } from '@faker-js/faker';

export interface ProfileData {
    [key: string]: string;
}

export const FORM_TYPES = ['application', 'event', 'signup', 'general'] as const;
export type FormType = typeof FORM_TYPES[number];

export const PROFILE_TYPES = ['random', 'default', 'persona-a', 'persona-b'] as const;
export type ProfileType = typeof PROFILE_TYPES[number];

type FormTemplateGroup = 'applicationEvent' | 'signupGeneral';

const FORM_GROUP_BY_TYPE: Record<FormType, FormTemplateGroup> = {
    application: 'applicationEvent',
    event: 'applicationEvent',
    signup: 'signupGeneral',
    general: 'signupGeneral'
};

const defaultFormTemplates: Record<FormTemplateGroup, ProfileData> = {
    applicationEvent: {
        salutation: 'Mr',
        salutationId: '1',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        genderId: '1',
        relationshipId: '1',
        email: 'qa.default@test.com',
        phone: '+996777777777',
        mobile: '+996777777777',
        homePhone: '+996777777777',
        workPhone: '+996777777777',
        communicationPreference: '1',
        dateOfBirth: '1998-09-15',
        company: 'QA Academy',
        jobTitle: 'Student',
        schoolName: 'QA Test School',
        programName: 'Computer Science',
        enrollmentTerm: 'Fall 2026',
        eventName: 'Open Day',
        eventCampusId: '1',
        eventId: '1',
        eventTypeAndDate: '1',
        subTours: '1',
        eventDate: '2026-07-10',
        totalAttendees: '2',
        attendeeCount: '1',
        addressLine1: '123 Test Street',
        address: '123 Test Street',
        addressLine2: 'Unit 5',
        city: 'Testville',
        state: 'California',
        postalCode: '12345',
        postCode: '12345',
        country: 'United States',
        nationality: 'American',
        notes: 'Filled by QA form template',
        description: 'Autofilled test record',
        message: 'Filled by QA form template',
        alumniId: 'ALUM123',
        graduationYear: '2020',
        nameAtSchool: 'John Tester',
        personalTourRequested: '1',
        ptDate: '2026-05-01',
        sendProspectus: '1',
        sendProspectusContact2: '1',
        sendConfirmationContact2: '1',
        isSpouse: '1',
        isFirstVisit: '1',
        sublocality: 'Test Sublocality',
        administrativeAreaId: '1',
        countryId: '1',
        familyConnectionId: '1',
        familyCircumstancesIds: '1',
        familyTypeIds: '1',
        geographicStatusId: '1',
        mainLanguageId: '1',
        studentResidenceId: '1',
        siblingsId: '0',
        hasFutureSiblings: '1',
        hearAboutUsId: '1',
        campusId: '1',
        religionId: '1',
        indigenousStatusId: '1',
        boardingTypeId: '1',
        startingYear: '1',
        startingPeriodId: '1',
        schoolIntakeYearId: '1',
        classGroups: '1',
        submittedApplication: '1',
        currentSchoolId: '',
        currentSchoolYearId: '1',
        hasSpecialNeeds: 'false',
        isInternational: 'false',
        countryOfOriginId: '1',
        password: 'Test@1234!'
    },
    signupGeneral: {
        firstName: 'Jane',
        lastName: 'Tester',
        fullName: 'Jane Tester',
        salutationId: '1',
        genderId: '1',
        relationshipId: '1',
        email: 'qa.default@test.com',
        phone: '+996777777777',
        mobile: '+996777777777',
        homePhone: '+996777777777',
        workPhone: '+996777777777',
        communicationPreference: '1',
        company: 'QA Inc',
        jobTitle: 'QA Engineer',
        addressLine1: '500 Demo Road',
        address: '500 Demo Road',
        addressLine2: 'Floor 2',
        city: 'Demoville',
        state: 'New York',
        postalCode: '10001',
        postCode: '10001',
        country: 'United States',
        website: 'https://example.com',
        notes: 'Signup/general template data',
        description: 'Full autofill dataset for signup/general form',
        message: 'Signup/general template data',
        ticketCount: '2',
        attendeeCount: '2',
        totalAttendees: '2',
        sendProspectus: '1',
        hasFutureSiblings: '1',
        hearAboutUsId: '1',
        password: 'Test@1234!',
        confirmPassword: 'Test@1234!'
    }
};

// Persona A — Local day student, male, starting 2030
const personaA: ProfileData = {
    salutation: 'Mr',
    salutationId: '1',
    firstName: 'James',
    lastName: 'Wilson',
    fullName: 'James Wilson',
    nameAtSchool: 'James Wilson',
    genderId: '1',
    relationshipId: '1',
    email: 'james.wilson.parent@qa.test',
    phone: '+996777777777',
    mobile: '+996777777777',
    homePhone: '+996777777777',
    workPhone: '+996777777777',
    communicationPreference: '1',
    dateOfBirth: '2009-03-24',
    company: 'Wilson Pty Ltd',
    jobTitle: 'Engineer',
    schoolName: 'Sydney Grammar',
    programName: 'Computer Science',
    enrollmentTerm: 'Term 1 2030',
    eventName: 'Open Day',
    eventCampusId: '1',
    eventId: '1',
    eventTypeAndDate: '1',
    subTours: '1',
    eventDate: '2026-07-10',
    ticketCount: '2',
    totalAttendees: '2',
    attendeeCount: '1',
    addressLine1: '42 Banksia Drive',
    address: '42 Banksia Drive',
    addressLine2: 'Unit 1',
    city: 'Sydney',
    state: 'New South Wales',
    postalCode: '2000',
    postCode: '2000',
    country: 'Australia',
    nationality: 'Australian',
    website: 'https://example.com',
    notes: 'Persona A — Local Day Student',
    description: 'Persona A QA test record',
    message: 'Persona A — Local Day Student',
    alumniId: '',
    graduationYear: '',
    personalTourRequested: '1',
    ptDate: '2026-05-01',
    sendProspectus: '1',
    sendProspectusContact2: '1',
    sendConfirmationContact2: '1',
    isSpouse: '1',
    isFirstVisit: '1',
    sublocality: 'Surry Hills',
    administrativeAreaId: '1',
    countryId: '1',
    familyConnectionId: '1',
    familyCircumstancesIds: '1',
    familyTypeIds: '1',
    geographicStatusId: '1',
    mainLanguageId: '1',
    studentResidenceId: '2',
    siblingsId: '1',
    hasFutureSiblings: '0',
    hearAboutUsId: '1',
    campusId: '1',
    religionId: '1',
    indigenousStatusId: '1',
    boardingTypeId: '2',
    startingYear: '2030',
    startingPeriodId: '1',
    schoolIntakeYearId: '1',
    classGroups: '1',
    submittedApplication: '0',
    currentSchoolId: '',
    currentSchoolYearId: '1',
    hasSpecialNeeds: 'false',
    isInternational: 'false',
    countryOfOriginId: '1',
    password: 'Test@1234!',
    confirmPassword: 'Test@1234!'
};

// Persona B — International boarding student, female, starting 2026
const personaB: ProfileData = {
    salutation: 'Ms',
    salutationId: '2',
    firstName: 'Sophie',
    lastName: 'Chen',
    fullName: 'Sophie Chen',
    nameAtSchool: 'Sophie Chen',
    genderId: '2',
    relationshipId: '1',
    email: 'wei.chen.parent@qa.test',
    phone: '+996777777777',
    mobile: '+996777777777',
    homePhone: '+996777777777',
    workPhone: '+996777777777',
    communicationPreference: '1',
    dateOfBirth: '2010-06-15',
    company: 'Chen Enterprises',
    jobTitle: 'Director',
    schoolName: 'Beijing High School',
    programName: 'Science',
    enrollmentTerm: 'Term 1 2026',
    eventName: 'Open Day',
    eventCampusId: '1',
    eventId: '1',
    eventTypeAndDate: '1',
    subTours: '1',
    eventDate: '2026-07-10',
    ticketCount: '2',
    totalAttendees: '2',
    attendeeCount: '1',
    addressLine1: '88 Harbour View Road',
    address: '88 Harbour View Road',
    addressLine2: 'Apt 12',
    city: 'Melbourne',
    state: 'Victoria',
    postalCode: '3000',
    postCode: '3000',
    country: 'China',
    nationality: 'Chinese',
    website: 'https://example.com',
    notes: 'Persona B — International Boarding Student',
    description: 'Persona B QA test record',
    message: 'Persona B — International Boarding Student',
    alumniId: '',
    graduationYear: '',
    personalTourRequested: '1',
    ptDate: '2026-05-01',
    sendProspectus: '1',
    sendProspectusContact2: '1',
    sendConfirmationContact2: '1',
    isSpouse: '0',
    isFirstVisit: '1',
    sublocality: 'South Yarra',
    administrativeAreaId: '2',
    countryId: '2',
    familyConnectionId: '1',
    familyCircumstancesIds: '2',
    familyTypeIds: '2',
    geographicStatusId: '2',
    mainLanguageId: '2',
    studentResidenceId: '1',
    siblingsId: '0',
    hasFutureSiblings: '1',
    hearAboutUsId: '2',
    campusId: '1',
    religionId: '2',
    indigenousStatusId: '1',
    boardingTypeId: '1',
    startingYear: '2026',
    startingPeriodId: '1',
    schoolIntakeYearId: '2',
    classGroups: '2',
    submittedApplication: '0',
    currentSchoolId: '',
    currentSchoolYearId: '2',
    hasSpecialNeeds: 'false',
    isInternational: 'true',
    countryOfOriginId: '2',
    password: 'Test@1234!',
    confirmPassword: 'Test@1234!'
};

const FIELD_ALIASES: Record<string, string[]> = {
    salutation: ['salutation', 'title'],
    salutationId: ['salutationid'],
    firstName: ['firstname', 'first_name', 'givenname', 'given_name'],
    lastName: ['lastname', 'last_name', 'surname', 'familyname', 'family_name'],
    fullName: ['fullname', 'full_name', 'name'],
    nameAtSchool: ['nameatschool', 'name_at_school'],
    genderId: ['genderid', 'gender'],
    relationshipId: ['relationshipid', 'relationship', 'relationtostudent'],
    email: ['email', 'mail', 'emailaddress'],
    phone: ['phone', 'phonenumber', 'telephone', 'tel'],
    mobile: ['mobile', 'mobilephone', 'cellphone', 'cell'],
    homePhone: ['homephone', 'home_phone'],
    workPhone: ['workphone', 'work_phone', 'officephone'],
    communicationPreference: ['communicationpreference', 'preferredcommunication'],
    dateOfBirth: ['dateofbirth', 'dob', 'birthdate', 'bday', 'birthday'],
    company: ['company', 'organization', 'organisation', 'employer'],
    jobTitle: ['jobtitle', 'position', 'role'],
    schoolName: ['schoolname', 'school'],
    programName: ['programname', 'programme', 'program'],
    enrollmentTerm: ['enrollmentterm', 'enrolmentterm', 'term', 'semester', 'intake'],
    eventName: ['eventname', 'event'],
    eventCampusId: ['eventcampusid'],
    eventId: ['eventid'],
        eventTypeAndDate: ['eventtypeanddate', 'event_type_and_date', 'eventtype'],
    subTours: ['subtours', 'subtour'],
        eventDate: ['eventdate', 'event_type_and_date', 'eventtypeanddate'],
    ticketCount: ['ticketcount', 'tickets'],
    totalAttendees: ['totalattendees'],
        attendeeCount: [
            'attendeecount',
            'attendees',
            'participantcount',
            'howmany',
            'howmanywillbeattending',
            'attending'
        ],
    addressLine1: ['addressline1', 'address1', 'street', 'address', 'streetaddress'],
    address: ['address'],
    addressLine2: ['addressline2', 'address2', 'unit', 'apartment', 'sublocality', 'citydistrict'],
    city: ['city', 'town', 'suburb', 'addresslevel2', 'locality'],
    state: ['state', 'province', 'region', 'administrativearea', 'addresslevel1'],
    postalCode: ['postalcode', 'postcode', 'zipcode', 'zip'],
    postCode: ['postcode'],
    countryId: ['countryid'],
    country: ['country'],
    nationality: ['nationality'],
    website: ['website', 'url'],
    notes: ['notes', 'note', 'comment', 'remarks'],
    description: ['description', 'details', 'about'],
    message: ['message', 'additionalinformation', 'anyquestions'],
    alumniId: ['alumniid', 'alumni_id'],
    graduationYear: ['graduationyear', 'gradyear'],
    personalTourRequested: ['personaltourrequested'],
    ptDate: ['ptdate'],
    sendProspectus: ['sendprospectus'],
    sendProspectusContact2: ['sendprospectuscontact2'],
    sendConfirmationContact2: ['sendconfirmationcontact2'],
    isSpouse: ['isspouse'],
    isFirstVisit: ['isfirstvisit'],
    administrativeAreaId: ['administrativeareaid', 'stateid', 'provinceid'],
    familyConnectionId: ['familyconnectionid'],
    familyCircumstancesIds: ['familycircumstancesids', 'familycircumstances'],
    familyTypeIds: ['familytypeids', 'familytypes'],
    geographicStatusId: ['geographicstatusid'],
    mainLanguageId: ['mainlanguageid', 'languageid', 'language'],
    studentResidenceId: ['studentresidenceid'],
    siblingsId: ['siblingsid'],
    hasFutureSiblings: ['hasfuturesiblings'],
    hearAboutUsId: ['hearaboutusid'],
    campusId: ['campusid', 'campus'],
    religionId: ['religionid', 'religion'],
    indigenousStatusId: ['indigenousstatusid', 'indigenous'],
    boardingTypeId: ['boardingtypeid', 'boarding'],
    startingYear: ['startingyear', 'startyear'],
    startingPeriodId: ['startingperiodid', 'startperiod'],
    schoolIntakeYearId: ['schoolintakeyearid', 'intakeyear'],
    classGroups: ['classgroups', 'classgroup'],
    submittedApplication: ['submittedapplication'],
    currentSchoolId: ['currentschoolid'],
    currentSchoolYearId: ['currentschoolyearid'],
    hasSpecialNeeds: ['hasspecialneeds', 'specialneeds'],
    specialNeedsReason: ['specialneedsreason'],
    otherInterests: ['otherinterests'],
    isInternational: ['isinternational'],
    countryOfOriginId: ['countryoforiginid'],
    password: ['password', 'passcode'],
    confirmPassword: ['confirmpassword', 'passwordconfirm', 'repeatpassword']
};

// Question-label phrases (normalized, no separators) seen in real ET form templates.
// Matched by substring against label/placeholder hints — covers admin-configured
// custom fields where no formcontrolname exists.
const LABEL_PHRASES: Record<string, string> = {
    hearabout: 'hearAboutUsId',
    howdidyouhear: 'hearAboutUsId',
    otherchildren: 'hasFutureSiblings',
    futuresiblings: 'hasFutureSiblings',
    privatetour: 'personalTourRequested',
    personaltour: 'personalTourRequested',
    prospectus: 'sendProspectus',
    religio: 'religionId',
    boarding: 'boardingTypeId',
    catchment: 'geographicStatusId',
    specialneeds: 'hasSpecialNeeds',
    learningneeds: 'hasSpecialNeeds',
    currentschool: 'currentSchoolId',
    startingyear: 'startingYear',
    yearofentry: 'startingYear',
    entryyear: 'startingYear',
    yearlevel: 'schoolIntakeYearId',
    intakeyear: 'schoolIntakeYearId',
    enrolmentyearlevel: 'schoolIntakeYearId',
    languagespokenathome: 'mainLanguageId',
    mainlanguage: 'mainLanguageId',
    indigenous: 'indigenousStatusId',
    aboriginal: 'indigenousStatusId',
    torresstrait: 'indigenousStatusId',
    countryoforigin: 'countryOfOriginId',
    countryofbirth: 'countryOfOriginId',
    firstvisit: 'isFirstVisit',
    howmanypeople: 'totalAttendees',
    attendee: 'totalAttendees',
    liveswith: 'studentResidenceId',
    studentresidence: 'studentResidenceId',
    familytype: 'familyTypeIds',
    familycircumstance: 'familyCircumstancesIds',
    familyconnection: 'familyConnectionId',
    connectiontotheschool: 'familyConnectionId',
    sibling: 'siblingsId',
    interests: 'otherInterests',
    dateofbirth: 'dateOfBirth',
    communicationpreference: 'communicationPreference',
    preferredmethodofcommunication: 'communicationPreference'
};

// Aliases that are too generic to match as part of a longer hint —
// they only count when the hint is exactly this token.
const EXACT_ONLY_ALIASES = new Set(['name', 'title', 'role', 'about', 'details', 'other', 'no', 'unit']);

// Angular/Material auto-generated identifiers carry no field meaning.
const GENERIC_HINT_PATTERN = /^(val|search|on|off|true|false|mat-[a-z-]*-?\d+|mat-radio-group-\d+|ng-[a-z0-9-]+|cdk-[a-z0-9-]+|customfield\d+|custom-field-\d+|g-recaptcha-response.*|mat-input-\d+|mat-select-\d+|mat-checkbox-\d+-input|formly_[a-z0-9_]+)$/i;

export type FieldHint = {
    text: string;
    weight: number;
    source: string;
};

function normalizeValue(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function unique(values: string[]): string[] {
    return [...new Set(values.filter(Boolean))];
}

function splitWords(value: string): string[] {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .toLowerCase()
        .split(' ')
        .filter(Boolean);
}

type AliasMatchKind = 'exact' | 'word' | 'substring';

function matchAliasInHint(hintJoined: string, hintWords: string[], alias: string): AliasMatchKind | null {
    if (hintJoined === alias) return 'exact';

    // Match alias against any contiguous run of hint words ("first-name", "Job Title", schema paths)
    for (let i = 0; i < hintWords.length; i++) {
        let acc = '';
        for (let j = i; j < hintWords.length; j++) {
            acc += hintWords[j];
            if (acc === alias) return 'word';
            if (acc.length >= alias.length) break;
        }
    }

    if (alias.length >= 5 && hintJoined.includes(alias)) return 'substring';
    return null;
}

export function isGenericHintToken(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return true;
    return GENERIC_HINT_PATTERN.test(trimmed) || GENERIC_HINT_PATTERN.test(normalizeValue(trimmed));
}

export type ResolvedFieldKey = {
    key: string;
    score: number;
    hint: string;
    source: string;
};

const MATCH_MULTIPLIER: Record<AliasMatchKind, number> = {
    exact: 4,
    word: 2.5,
    substring: 1.5
};

const MIN_MATCH_SCORE = 8;

export function resolveFieldKeyFromHints(hints: FieldHint[]): ResolvedFieldKey | null {
    let best: ResolvedFieldKey | null = null;

    const consider = (key: string, score: number, hint: FieldHint) => {
        if (score < MIN_MATCH_SCORE) return;
        if (!best || score > best.score) {
            best = { key, score, hint: hint.text, source: hint.source };
        }
    };

    for (const hint of hints) {
        const joined = normalizeValue(hint.text);
        if (!joined || isGenericHintToken(hint.text)) continue;
        const words = splitWords(hint.text);

        for (const [phrase, key] of Object.entries(LABEL_PHRASES)) {
            if (joined.includes(phrase)) {
                consider(key, hint.weight * 3 + phrase.length * 0.1, hint);
            }
        }

        for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
            for (const alias of aliases) {
                const kind = matchAliasInHint(joined, words, alias);
                if (!kind) continue;
                if (EXACT_ONLY_ALIASES.has(alias) && kind !== 'exact') continue;
                consider(key, hint.weight * MATCH_MULTIPLIER[kind] + alias.length * 0.1, hint);
            }
        }
    }

    return best;
}

function buildRandomTemplate(group: FormTemplateGroup): ProfileData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const common = {
        salutation: 'Mr',
        salutationId: '1',
        firstName,
        lastName,
        fullName,
        nameAtSchool: fullName,
        genderId: '1',
        relationshipId: '1',
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: '+996777777777',
        mobile: '+996777777777',
        homePhone: '+996777777777',
        workPhone: '+996777777777',
        communicationPreference: '1',
        dateOfBirth: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString().split('T')[0],
        company: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
        schoolName: `${faker.location.city()} High School`,
        programName: 'Computer Science',
        enrollmentTerm: `Fall ${new Date().getFullYear() + 1}`,
        eventName: `${faker.word.adjective()} Event`,
        eventCampusId: '1',
        eventId: '1',
        eventTypeAndDate: '1',
        subTours: '1',
        eventDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
        ticketCount: '2',
        totalAttendees: '2',
        attendeeCount: '1',
        addressLine1: faker.location.streetAddress(),
        address: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode(),
        postCode: faker.location.zipCode(),
        country: faker.location.country(),
        nationality: 'American',
        website: faker.internet.url(),
        notes: faker.lorem.sentence(),
        description: faker.lorem.sentences(2),
        message: faker.lorem.sentence(),
        alumniId: faker.string.alphanumeric(8).toUpperCase(),
        graduationYear: faker.date.past({ years: 10 }).getFullYear().toString(),
        personalTourRequested: '1',
        ptDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
        sendProspectus: '1',
        sendProspectusContact2: '1',
        sendConfirmationContact2: '1',
        isSpouse: '1',
        isFirstVisit: '1',
        sublocality: faker.location.secondaryAddress(),
        administrativeAreaId: '1',
        countryId: '1',
        familyConnectionId: '1',
        familyCircumstancesIds: '1',
        familyTypeIds: '1',
        geographicStatusId: '1',
        mainLanguageId: '1',
        studentResidenceId: '1',
        siblingsId: '0',
        hasFutureSiblings: '1',
        hearAboutUsId: '1',
        campusId: '1',
        religionId: '1',
        indigenousStatusId: '1',
        boardingTypeId: '1',
        startingYear: '1',
        startingPeriodId: '1',
        schoolIntakeYearId: '1',
        classGroups: '1',
        submittedApplication: '1',
        currentSchoolId: '',
        currentSchoolYearId: '1',
        hasSpecialNeeds: 'false',
        isInternational: 'false',
        countryOfOriginId: '1',
        password: 'Test@1234!',
        confirmPassword: 'Test@1234!'
    };

    if (group === 'applicationEvent') {
        return common;
    }

    return {
        ...common,
        programName: '',
        enrollmentTerm: '',
        alumniId: '',
        graduationYear: '',
        ptDate: ''
    };
}

function toGroup(formType: string): FormTemplateGroup {
    if (formType in FORM_GROUP_BY_TYPE) {
        return FORM_GROUP_BY_TYPE[formType as FormType];
    }
    return 'signupGeneral';
}

export function buildProfileData(profileType: string, formType: string): ProfileData {
    if (profileType === 'persona-a') return personaA;
    if (profileType === 'persona-b') return personaB;
    const group = toGroup(formType);
    if (profileType === 'random') {
        return buildRandomTemplate(group);
    }
    return defaultFormTemplates[group];
}

function resolveFieldKey(fieldName: string): string | null {
    const resolved = resolveFieldKeyFromHints([{ text: fieldName, weight: 5, source: 'legacy' }]);
    return resolved?.key || null;
}

export function getFieldKey(fieldName: string): string | null {
    return resolveFieldKey(fieldName);
}

export function getFieldValue(fieldName: string, profileData: ProfileData, inputType = ''): string {
    if (!fieldName) return '';

    const fieldKey = resolveFieldKey(fieldName);
    if (fieldKey && profileData[fieldKey] !== undefined) {
        return profileData[fieldKey];
    }

    const normalizedType = inputType.toLowerCase();
    if (normalizedType === 'email') return profileData.email || 'qa@test.com';
    if (normalizedType === 'tel') return profileData.phone || '+996777777777';
    if (normalizedType === 'url') return profileData.website || 'https://example.com';
    if (normalizedType === 'date') return profileData.ptDate || profileData.eventDate || '2026-01-01';
    if (normalizedType === 'number') return profileData.attendeeCount || '1';

    return profileData.notes || 'QA Test Data';
}

function cleanHintText(value: string | null | undefined): string {
    return (value || '').replace(/\s+/g, ' ').trim();
}

/**
 * Collects weighted identity hints for a form control.
 *
 * ET renders most controls inside custom wrappers (app-radio-group,
 * app-other-list-item, app-checkbox-group, app-select-search, app-phone-input)
 * whose OUTER element carries the real formcontrolname/htmlid, while the inner
 * control gets a meaningless formControlName="val" — so ancestors are the
 * strongest signal after the element's own (non-generic) attributes.
 */
export function collectFieldHints(element: Element): FieldHint[] {
    const hints: FieldHint[] = [];
    const seen = new Set<string>();
    const push = (text: string | null | undefined, weight: number, source: string) => {
        const cleaned = cleanHintText(text);
        if (!cleaned || cleaned === 'val') return;
        const dedupeKey = `${cleaned.toLowerCase()}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        hints.push({ text: cleaned.slice(0, 160), weight, source });
    };

    const attr = (name: string) => element.getAttribute(name);

    push(attr('formcontrolname'), 10, 'formcontrolname');
    push(attr('data-testid'), 10, 'data-testid');
    push(attr('htmlid'), 9, 'htmlid');

    // Ancestor custom-component wrappers carry the real field identity in ET
    let ancestor = element.parentElement;
    for (let depth = 0; ancestor && ancestor !== document.body && depth < 8; depth++) {
        push(ancestor.getAttribute('formcontrolname'), 10, 'wrapper-formcontrolname');
        push(ancestor.getAttribute('htmlid'), 9, 'wrapper-htmlid');
        push(ancestor.getAttribute('data-testid'), 8, 'wrapper-data-testid');
        ancestor = ancestor.parentElement;
    }

    push(attr('autocomplete'), 9, 'autocomplete');
    push(element.id, 8, 'id');
    push(attr('name'), 8, 'name');
    push(attr('aria-label'), 7, 'aria-label');

    (attr('aria-labelledby') || '')
        .split(' ')
        .map((id) => id.trim())
        .filter(Boolean)
        .forEach((id) => push(document.getElementById(id)?.textContent, 7, 'aria-labelledby'));

    const labelable = element as HTMLInputElement;
    if (labelable.labels && labelable.labels.length > 0) {
        Array.from(labelable.labels).forEach((label) => push(label.textContent, 6, 'label'));
    }
    push(element.closest('label')?.textContent, 6, 'wrapping-label');
    if (element.id) {
        push(document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent, 6, 'label-for');
    }

    const formField = element.closest('mat-form-field, .mat-mdc-form-field, .form-group, .field, .input-group');
    if (formField) {
        push(formField.querySelector('mat-label')?.textContent, 6, 'mat-label');
        push(formField.querySelector('.mat-form-field-label, .mat-mdc-floating-label')?.textContent, 5, 'floating-label');
    }

    // Question text: ET puts a <label class="required"> next to the control inside a grid column
    const questionContainer = element.closest('[class*="col-"], .form-group, .question, app-radio-group, app-checkbox-group, app-other-list-item, app-select-search');
    const questionScope = questionContainer?.closest('[class*="col-"]') || questionContainer;
    if (questionScope) {
        const questionLabel = Array.from(questionScope.querySelectorAll('label, legend'))
            .find((label) => !label.closest('mat-radio-button, mat-checkbox, mat-form-field, mat-slide-toggle, .mat-mdc-form-field'));
        push(questionLabel?.textContent, 5, 'question-label');
    }

    push(attr('placeholder'), 4, 'placeholder');
    push(attr('title'), 4, 'title');

    return hints;
}

/**
 * Flat string of all hints — used for learning keys, reports and legacy checks.
 */
export function getFieldName(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    return unique(collectFieldHints(element).map((hint) => hint.text)).join(' ');
}
