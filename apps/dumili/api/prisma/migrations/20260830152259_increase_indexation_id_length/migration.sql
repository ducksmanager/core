alter table page
    drop foreign key page_indexation_id_fk;

alter table issue_suggestion
    drop foreign key issue_suggestion_indexation_id_fk;

alter table entry
    drop foreign key entry_indexation_id_fk;

alter table indexation
    modify id varchar(36) not null;

alter table indexation
    modify id varchar(36) not null default (uuid());

alter table page
    modify indexation_id varchar(36) not null;

alter table issue_suggestion
    modify indexation_id varchar(36) not null;

alter table entry
    modify indexation_id varchar(36) not null;


alter table page
    add constraint page_indexation_id_fk
        foreign key (indexation_id) references indexation (id);

alter table issue_suggestion
    add constraint issue_suggestion_indexation_id_fk
        foreign key (indexation_id) references indexation (id);

alter table entry
    add constraint entry_indexation_id_fk
        foreign key (indexation_id) references indexation (id);