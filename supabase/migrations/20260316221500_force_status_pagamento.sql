-- Atualiza todos os trabalhos que não possuem status de pagamento para 'nao_pago'
UPDATE trabalhos 
SET status_pagamento = 'nao_pago' 
WHERE status_pagamento IS NULL OR status_pagamento = '';

-- Garante que a coluna não aceite nulos e tenha 'nao_pago' como padrão
ALTER TABLE trabalhos 
ALTER COLUMN status_pagamento SET DEFAULT 'nao_pago',
ALTER COLUMN status_pagamento SET NOT NULL;
