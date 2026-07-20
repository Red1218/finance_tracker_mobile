CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        CONSTRAINT fk_categories_user REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CONSTRAINT chk_categories_name_length CHECK (char_length(trim(name)) BETWEEN 1 AND 50),
    icon TEXT NOT NULL,
    color TEXT NOT NULL CONSTRAINT chk_categories_color_hex CHECK (color ~* '^#[0-9a-f]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_user_id_deleted_at ON categories(user_id, deleted_at);

CREATE UNIQUE INDEX uq_categories_active_name_per_user 
ON categories(user_id, lower(name)) 
WHERE deleted_at IS NULL;

CREATE TRIGGER trg_categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE categories IS 'User-defined expense categories.';
COMMENT ON COLUMN categories.user_id IS 'Owner of the category. References auth.users.';
COMMENT ON COLUMN categories.icon IS 'Lucide icon name used by the client.';
COMMENT ON COLUMN categories.color IS 'Hexadecimal display color (#RRGGBB).';
COMMENT ON COLUMN categories.deleted_at IS 'Soft delete timestamp. NULL indicates an active category.';
COMMENT ON COLUMN categories.name IS 'User-defined category name. Must be unique per user among active categories.';