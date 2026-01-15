interface CategorySelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  required?: boolean;
  includeAll?: boolean;
  className?: string;
}

export default function CategorySelect({ 
  value, 
  onChange, 
  name = "category",
  required = false,
  includeAll = false,
  className = "w-full border p-2 rounded"
}: CategorySelectProps) {
  return (
    <select
      name={name}
      className={className}
      onChange={onChange}
      value={value}
      required={required}
    >
      <option value="">{includeAll ? "Todas as categorias" : "Selecione uma categoria"}</option>
      
      <optgroup label="Feminino">
        <option value="Vestidos">Vestidos</option>
        <option value="Blusas Femininas">Blusas Femininas</option>
        <option value="Shorts Femininos">Shorts Femininos</option>
        <option value="Calças Femininas">Calças Femininas</option>
        <option value="Saias">Saias</option>
        <option value="Conjuntos Femininos">Conjuntos Femininos</option>
      </optgroup>
      
      <optgroup label="Masculino">
        <option value="Camisas Masculinas">Camisas Masculinas</option>
        <option value="Camisetas Masculinas">Camisetas Masculinas</option>
        <option value="Calças Masculinas">Calças Masculinas</option>
        <option value="Shorts Masculinos">Shorts Masculinos</option>
        <option value="Bermudas">Bermudas</option>
        <option value="Conjuntos Masculinos">Conjuntos Masculinos</option>
      </optgroup>
      
      <optgroup label="Acessórios">
        <option value="Acessórios Femininos">Acessórios Femininos</option>
        <option value="Acessórios Masculinos">Acessórios Masculinos</option>
        <option value="Bolsas">Bolsas</option>
        <option value="Carteiras">Carteiras</option>
        <option value="Cintos">Cintos</option>
        <option value="Relógios">Relógios</option>
        <option value="Óculos">Óculos</option>
        <option value="Joias">Joias</option>
        <option value="Bijuterias">Bijuterias</option>
      </optgroup>
      
      <optgroup label="Calçados">
        <option value="Calçados Femininos">Calçados Femininos</option>
        <option value="Calçados Masculinos">Calçados Masculinos</option>
        <option value="Tênis">Tênis</option>
        <option value="Sandálias">Sandálias</option>
        <option value="Sapatos">Sapatos</option>
      </optgroup>
      
      <optgroup label="Eletrônicos">
        <option value="Eletrônicos">Eletrônicos</option>
        <option value="Smartphones">Smartphones</option>
        <option value="Fones de Ouvido">Fones de Ouvido</option>
        <option value="Smartwatch">Smartwatch</option>
      </optgroup>
      
      <option value="Outros">Outros</option>
    </select>
  );
}