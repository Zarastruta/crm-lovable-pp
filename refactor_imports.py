import os
import re

# Todos os arquivos que podem ter o import de Badges
files_to_update = [
    'src/pages/Orcamentos.tsx',
    'src/pages/TrabalhoDetalhe.tsx',
    'src/pages/Trabalhos.tsx',
    'src/pages/OrcamentoDetalhe.tsx',
    'src/pages/Financeiro.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Equipe.tsx',
    'src/pages/ContatoDetalhe.tsx',
    'src/pages/Condominios.tsx',
    'src/pages/CondominioDetalhe.tsx',
    'src/pages/Clientes.tsx',
    'src/pages/Contatos.tsx',
    'src/components/modals/BuscaGlobalModal.tsx',
    'src/components/shared/KanbanBoard.tsx',
    'src/components/modals/OrcamentoModal.tsx',
    'src/services/PdfService.ts'
]

# Funções que foram movidas do Badges.tsx para o utils.ts
utils_funcs = ['formatCurrency', 'formatDate', 'getStatusColor', 'getPrioridadeColor', 'cn']

for file_path in files_to_update:
    # Converter para caminho absoluto do sistema
    abs_path = os.path.join(r'C:\Users\Pichau\Desktop\AGORASIMEIN\crm-lovable-pp\crm-lovable-pp-main', file_path)
    
    if not os.path.exists(abs_path):
        print(f"Skipping {file_path} - not found")
        continue

    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex para encontrar o import de @/components/shared/Badges
    # pode ter multiplas linhas
    pattern = r'import\s+\{([^}]*)\}\s+from\s+[\"\']@/components/shared/Badges[\"\'];?'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        imports_raw = match.group(1).split(',')
        imports = [i.strip() for i in imports_raw if i.strip()]
        
        to_utils = [i for i in imports if i in utils_funcs]
        stay_badges = [i for i in imports if i not in utils_funcs]
        
        if not to_utils:
            print(f"Nothing to move in {file_path}")
            continue

        print(f"Processing {file_path}: moving {to_utils} to utils")
        
        # 1. Tratar o import de utils
        utils_pattern = r'import\s+\{([^}]*)\}\s+from\s+[\"\']@/lib/utils[\"\'];?'
        utils_match = re.search(utils_pattern, content, re.DOTALL)
        
        if utils_match:
            existing_utils_raw = utils_match.group(1).split(',')
            existing_utils = [i.strip() for i in existing_utils_raw if i.strip()]
            all_utils = sorted(list(set(existing_utils + to_utils)))
            new_utils_import = f'import {{ {", ".join(all_utils)} }} from "@/lib/utils";'
            new_content = content.replace(utils_match.group(0), new_utils_import)
        else:
            # Adicionar novo import de utils no topo (ou perto dos outros imports)
            utils_import = f'import {{ {", ".join(sorted(to_utils))} }} from "@/lib/utils";'
            # Inserir no início do arquivo ou após outras importações
            new_content = utils_import + "\n" + content
            
        # 2. Atualizar o import de Badges
        # Recapturar o match no new_content caso ele tenha mudado de posição
        match_in_new = re.search(pattern, new_content, re.DOTALL)
        if match_in_new:
            if stay_badges:
                new_badges_import = f'import {{ {", ".join(stay_badges)} }} from "@/components/shared/Badges";'
                new_content = new_content.replace(match_in_new.group(0), new_badges_import)
            else:
                # Se não sobrou nada, remove a linha e a quebra de linha seguinte
                new_content = new_content.replace(match_in_new.group(0), "").strip() + "\n"
        
        # Cleanup
        new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
        
        with open(abs_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully updated {file_path}")
