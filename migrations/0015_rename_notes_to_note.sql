-- songs.notes / events.notes を setlists.note と揃えて単数形 note にリネーム。
alter table songs rename column notes to note;
alter table events rename column notes to note;
