# language: pt
Funcionalidade: Ciclo de vida da Ordem de Serviço (saga coreografada)
  Como oficina mecânica
  Quero que a ordem de serviço avance de status conforme os eventos da saga
  Para coordenar atendimento, cobrança e execução entre os microsserviços

  Cenário: Fluxo completo — da abertura à finalização
    Dado que um cliente com veículo abre uma ordem de serviço
    Então o status da ordem é "Recebido"
    Quando o orçamento é enviado para aprovação
    Então o status da ordem é "Aguardando aprovação"
    Quando o pagamento é aprovado
    Então o status da ordem é "Em execução"
    Quando a execução do reparo é finalizada
    Então o status da ordem é "Finalizado"

  Cenário: Compensação da saga — pagamento recusado encerra a ordem
    Dado que um cliente com veículo abre uma ordem de serviço
    E o orçamento é enviado para aprovação
    Quando o pagamento é recusado
    Então o status da ordem é "Finalizado"

  Cenário: Compensação da saga — orçamento recusado encerra a ordem
    Dado que um cliente com veículo abre uma ordem de serviço
    E o orçamento é enviado para aprovação
    Quando o orçamento é recusado pelo cliente
    Então o status da ordem é "Finalizado"
