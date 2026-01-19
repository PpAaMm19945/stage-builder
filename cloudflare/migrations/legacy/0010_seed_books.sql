-- SchoolOS Book Catalog Seed Data
-- Adds all available books to the books table
-- Run after 0009_books_schema.sql

-- ============================================================================
-- African Men of Faith Series (Age 6-9, Language/Spiritual)
-- ============================================================================

INSERT OR IGNORE INTO books (id, title, description, min_age_months, max_age_months, cover_image_url, content_path, learning_stage, domain, is_active) VALUES
('athanasius', 'Athanasius and the Truth', 'The inspiring story of Athanasius of Alexandria who stood firm for the truth about Jesus, even when everyone else disagreed.', 72, 108, '/books/African Men of Faith/Athanasius/cover.png', '/books/African Men of Faith/Athanasius/content.md', 'early-years', 'language', 1),
('augustine', 'Augustine''s New Heart', 'The amazing journey of Augustine from a life of sin to becoming one of the greatest Christian teachers in history.', 72, 108, '/books/African Men of Faith/Augustine/cover.png', '/books/African Men of Faith/Augustine/content.md', 'early-years', 'language', 1),
('cyprian', 'Cyprian the Brave', 'The story of Cyprian of Carthage, a wealthy man who gave up everything to follow Jesus and lead the church.', 72, 108, '/books/African Men of Faith/Cyprian/cover.png', '/books/African Men of Faith/Cyprian/content.md', 'early-years', 'language', 1),
('moses-the-black', 'Moses the Strong', 'The powerful story of Saint Moses the Black, a feared robber who was transformed by God''s grace into a gentle and wise monk.', 72, 108, '/books/African Men of Faith/Moses/cover.png', '/books/African Men of Faith/Moses/content.md', 'early-years', 'language', 1),
('perpetua', 'Perpetua''s Brave Choice', 'The true story of a young mother in ancient Africa who chose to follow Jesus no matter the cost.', 72, 108, '/books/African Men of Faith/Perpetua/cover.png', '/books/African Men of Faith/Perpetua/content.md', 'early-years', 'language', 1);

-- ============================================================================
-- The Gospel Series (Age 3-6, Spiritual)
-- ============================================================================

INSERT OR IGNORE INTO books (id, title, description, min_age_months, max_age_months, cover_image_url, content_path, learning_stage, domain, is_active) VALUES
('king-nebuchadnezzar', 'King Nebuchadnezzar', 'The story of the powerful king who learned that God is greater than any earthly ruler.', 36, 72, '/books/The Gospel Series/King Nebuchadnezzar/cover.png', '/books/The Gospel Series/King Nebuchadnezzar/content.md', 'early-years', 'spiritual', 1),
('pharaoh', 'Pharaoh: A Hardened Heart', 'The dramatic story of Pharaoh and the plagues of Egypt, showing that no one can resist God''s will.', 36, 72, '/books/The Gospel Series/Pharaoh/cover.png', '/books/The Gospel Series/Pharaoh/content.md', 'early-years', 'spiritual', 1),
('conversion-of-paul', 'The Conversion of Paul', 'How Saul, the enemy of Christians, met Jesus and became Paul, the great apostle.', 36, 72, '/books/The Gospel Series/The Conversion of Paul/cover.png', '/books/The Gospel Series/The Conversion of Paul/content.md', 'early-years', 'spiritual', 1),
('exodus-passover-lamb', 'The Exodus Passover Lamb', 'The story of God''s rescue of His people from slavery and the lamb that saved them.', 36, 72, '/books/The Gospel Series/The Exodus Passover Lamb/cover.png', '/books/The Gospel Series/The Exodus Passover Lamb/content.md', 'early-years', 'spiritual', 1),
('good-samaritan', 'The Good Samaritan', 'Jesus'' famous parable about loving your neighbor, even when it''s hard.', 36, 72, '/books/The Gospel Series/The Good Samaritan/cover.png', '/books/The Gospel Series/The Good Samaritan/content.md', 'early-years', 'spiritual', 1),
('great-banquet', 'The Great Banquet', 'A parable about God''s invitation to His kingdom and the excuses people make.', 36, 72, '/books/The Gospel Series/The Great Banquet/cover.png', '/books/The Gospel Series/The Great Banquet/content.md', 'early-years', 'spiritual', 1),
('prodigal-son', 'The Prodigal Son', 'The beautiful story of a father''s love and a son''s journey home.', 36, 72, '/books/The Gospel Series/The Prodigal Son/cover.png', '/books/The Gospel Series/The Prodigal Son/content.md', 'early-years', 'spiritual', 1),
('rich-young-ruler', 'The Rich Young Ruler', 'The story of a young man who loved his riches more than following Jesus.', 36, 72, '/books/The Gospel Series/The Rich Young Ruler/cover.png', '/books/The Gospel Series/The Rich Young Ruler/content.md', 'early-years', 'spiritual', 1),
('twin-brothers', 'The Twin Brothers', 'The story of Jacob and Esau and God''s sovereign choice.', 36, 72, '/books/The Gospel Series/The Twin Brothers/cover.png', '/books/The Gospel Series/The Twin Brothers/content.md', 'early-years', 'spiritual', 1);

-- ============================================================================
-- My First Books Series (Age 1-5, Various Domains) - English Only
-- ============================================================================

INSERT OR IGNORE INTO books (id, title, description, min_age_months, max_age_months, cover_image_url, content_path, learning_stage, domain, is_active) VALUES
('counting-to-ten', 'Counting to Ten', 'Learn to count to 10 with fun objects from everyday life!', 24, 60, '/books/My First Books/counting-to-five/cover.png', '/books/My First Books/counting-to-five/content.md', 'early-years', 'cognitive', 1),
('my-colors', 'My Colors', 'Discover colors in everyday objects from home!', 24, 48, '/books/My First Books/colors-around-me/cover.png', '/books/My First Books/colors-around-me/content.md', 'early-years', 'cognitive', 1),
('animal-friends', 'Animal Friends', 'Meet the friendly animals that live around us!', 24, 48, '/books/My First Books/animal-friends/cover.png', '/books/My First Books/animal-friends/content.md', 'early-years', 'language', 1),
('my-feelings-today', 'My Feelings Today', 'Learn about feelings! Happy, sad, angry, scared—all feelings are okay.', 24, 60, '/books/My First Books/my-feelings-today/cover.png', '/books/My First Books/my-feelings-today/content.md', 'early-years', 'social-emotional', 1),
('things-that-go', 'Things That Go', 'Discover exciting vehicles! From motorcycles to buses, learn what goes VROOM!', 12, 48, '/books/My First Books/things-that-go/cover.png', '/books/My First Books/things-that-go/content.md', 'early-years', 'cognitive', 1);
