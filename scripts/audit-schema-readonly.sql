-- Read-only schema inventory. Run on the verified production database before migrations.
-- No homeowner/contractor contact details are selected.
BEGIN TRANSACTION READ ONLY;
SELECT current_database() AS database_name, current_schema() AS schema_name;
SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('leads', 'partners', 'partner_applications',
    'partner_territories', 'partner_service_types', 'partner_lead_types',
    'lead_assignments', 'lead_price_rules', 'partner_billing_ledger')
ORDER BY table_name, ordinal_position;
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN ('leads', 'partners', 'partner_applications',
    'partner_territories', 'lead_assignments', 'partner_billing_ledger')
ORDER BY table_name, constraint_type;
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'partners', 'partner_applications',
    'partner_territories', 'lead_assignments', 'partner_billing_ledger')
ORDER BY tablename, indexname;
ROLLBACK;
