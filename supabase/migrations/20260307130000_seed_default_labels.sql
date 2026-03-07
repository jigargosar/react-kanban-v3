-- Seed 6 default labels (one per color) for every existing board that has fewer than 6 labels
INSERT INTO labels (id, board_id, title, color, position)
SELECT
    gen_random_uuid(),
    b.id,
    '',
    c.color,
    c.position
FROM boards b
CROSS JOIN (VALUES
    ('green',  'a0'),
    ('yellow', 'a1'),
    ('orange', 'a2'),
    ('red',    'a3'),
    ('purple', 'a4'),
    ('blue',   'a5')
) AS c(color, position)
WHERE NOT EXISTS (
    SELECT 1 FROM labels l WHERE l.board_id = b.id AND l.color = c.color
);
