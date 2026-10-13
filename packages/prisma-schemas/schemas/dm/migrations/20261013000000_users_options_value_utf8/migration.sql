-- Match numeros.issuecode so that comparisons between both columns don't require a per-row charset conversion
ALTER TABLE users_options
    MODIFY Option_valeur varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL;
