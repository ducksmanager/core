alter table entry
    drop foreign key entry_indexation_id_fk;

alter table entry
    add constraint entry_indexation_id_fk
        foreign key (indexation_id) references indexation (id)
            on update cascade;

alter table page
    drop foreign key page_indexation_id_fk;

alter table page
    add constraint page_indexation_id_fk
        foreign key (indexation_id) references indexation (id)
            on update cascade;


alter table issue_suggestion
    drop foreign key issue_suggestion_indexation_id_fk;

alter table issue_suggestion
    add constraint issue_suggestion_indexation_id_fk
        foreign key (indexation_id) references indexation (id)
            on update cascade;


update indexation set id=uuid();

alter table entry
    drop foreign key entry_indexation_id_fk;

alter table entry
    add constraint entry_indexation_id_fk
        foreign key (indexation_id) references indexation (id);

alter table page
    drop foreign key page_indexation_id_fk;

alter table page
    add constraint page_indexation_id_fk
        foreign key (indexation_id) references indexation (id);


alter table issue_suggestion
    drop foreign key issue_suggestion_indexation_id_fk;

alter table issue_suggestion
    add constraint issue_suggestion_indexation_id_fk
        foreign key (indexation_id) references indexation (id);
