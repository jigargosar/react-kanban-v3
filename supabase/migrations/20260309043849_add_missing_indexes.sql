create index idx_cards_column_id on cards(column_id);
create index idx_card_labels_label_id on card_labels(label_id);
create index idx_checklist_items_card_id on checklist_items(card_id);
