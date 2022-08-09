export interface User {
    id:                          number;
    username:                    string;
    password:                    string;
    accepterpartage:             boolean;
    isShareEnabled:              boolean|undefined;
    dateinscription:             PHPDate;
    email:                       string;
    recommandationslistemags:    boolean;
    betauser:                    boolean;
    affichervideo:               boolean;
    isVideoShown:                boolean|undefined;
    bibliothequeAfficherdoubles: boolean;
    bibliothequeTexture1:        string;
    bibliothequeSousTexture1:    string;
    bibliothequeTexture2:        string;
    bibliothequeSousTexture2:    string;
    presentationSentence:        string;
    precedentacces:              PHPDate;
    dernieracces:                PHPDate;
    options:                     Option[];
}

export interface PHPDate {
    timezone:  Timezone;
    offset:    number;
    timestamp: number;
}

export interface Timezone {
    name:        string;
    transitions: Transition[];
    location:    Location;
}

export interface Location {
    country_code: string;
    latitude:     number;
    longitude:    number;
    comments:     string;
}

export interface Transition {
    ts:     number;
    time:   string;
    offset: number;
    isdst:  boolean;
    abbr:   string;
}

export interface Option {
    id:           number;
    user:         null;
    optionNom:    string;
    optionValeur: string;
}
