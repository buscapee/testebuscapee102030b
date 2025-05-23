import { ServicePoint } from '../Models/servicePointModel.js';
import { User } from '../Models/useModel.js';

class ServicePointController {
  // Iniciar turno
  async criarTurno(req, res) {
    try {
      const { nickname, setor } = req.body;
      // Não permite mais de um turno aberto por usuário
      const turnoAberto = await ServicePoint.findOne({ nickname, aberto: true });
      if (turnoAberto) {
        return res.status(400).json({ error: 'Já existe um turno aberto para este usuário.' });
      }
      const agora = new Date();
      const novoTurno = await ServicePoint.create({
        nickname,
        setor: setor || 'Batalhão',
        inicio: agora,
        aberto: true,
        setores: [{ nome: setor || 'Batalhão', inicio: agora, fim: null }]
      });
      res.status(201).json(novoTurno);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao iniciar turno.' });
    }
  }

  // Listar turnos abertos
  async listarTurnosAbertos(req, res) {
    try {
      const turnos = await ServicePoint.find({ aberto: true });
      res.json(turnos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar turnos.' });
    }
  }

  // Encerrar turno
  async encerrarTurno(req, res) {
    try {
      const { nickname, admin } = req.body;
      const turno = await ServicePoint.findOne({ nickname, aberto: true });
      if (!turno) {
        return res.status(404).json({ error: 'Nenhum turno aberto encontrado.' });
      }
      turno.aberto = false;
      turno.fim = new Date();
      // Finaliza o período atual
      if (turno.setores && turno.setores.length > 0 && !turno.setores[turno.setores.length - 1].fim) {
        turno.setores[turno.setores.length - 1].fim = turno.fim;
      }
      // Calcular total de minutos do turno
      let totalMin = 0;
      (turno.setores || []).forEach(s => {
        if (s.inicio && s.fim) {
          totalMin += Math.floor((new Date(s.fim) - new Date(s.inicio)) / 60000);
        }
      });
      await turno.save();
      // Adicionar medalhas ao usuário SOMENTE se o próprio usuário finalizou
      if (admin === nickname && totalMin > 0) {
        const horas = Math.floor(totalMin / 60);
        if (horas > 0) {
          const user = await User.findOne({ nickname });
          let medalsAtual = 0;
          if (user && typeof user.medals === 'string') {
            medalsAtual = parseInt(user.medals) || 0;
          } else if (user && typeof user.medals === 'number') {
            medalsAtual = user.medals;
          }
          const medalsNovas = medalsAtual + 50 * horas;
          await User.updateOne({ nickname }, { $set: { medals: medalsNovas } });
        }
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao encerrar turno.' });
    }
  }

  // Trocar setor do turno aberto
  async patchTrocarSetor(req, res) {
    try {
      const { nickname, setor } = req.body;
      if (!nickname || !setor) {
        return res.status(400).json({ error: 'Nickname e setor são obrigatórios.' });
      }
      const turno = await ServicePoint.findOne({ nickname, aberto: true });
      if (!turno) {
        return res.status(404).json({ error: 'Nenhum turno aberto encontrado.' });
      }
      const agora = new Date();
      // Finaliza o período atual
      if (turno.setores && turno.setores.length > 0 && !turno.setores[turno.setores.length - 1].fim) {
        turno.setores[turno.setores.length - 1].fim = agora;
      }
      // Adiciona novo período
      turno.setores.push({ nome: setor, inicio: agora, fim: null });
      turno.setor = setor;
      await turno.save();
      res.json(turno);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao trocar setor.' });
    }
  }

  // Listar todos os turnos de um usuário
  async listarTurnosUsuario(req, res) {
    try {
      const { nickname } = req.params;
      if (!nickname) {
        return res.status(400).json({ error: 'Nickname é obrigatório.' });
      }
      const turnos = await ServicePoint.find({ nickname }).sort({ inicio: -1 });
      res.json(turnos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar turnos do usuário.' });
    }
  }

  // Listar todos os turnos do sistema
  async listarTodosTurnos(req, res) {
    try {
      const { nickname, dataDe, dataAte, setor } = req.query;
      const filtro = {};
      if (nickname) {
        filtro.nickname = { $regex: nickname, $options: 'i' };
      }
      if (dataDe || dataAte) {
        filtro.inicio = {};
        if (dataDe) filtro.inicio.$gte = new Date(dataDe);
        if (dataAte) filtro.inicio.$lte = new Date(dataAte);
      }
      if (setor) {
        // setor pode ser string ou array
        if (Array.isArray(setor)) {
          filtro['setores.nome'] = { $in: setor };
        } else {
          filtro['setores.nome'] = setor;
        }
      }
      const turnos = await ServicePoint.find(filtro).sort({ inicio: -1 });
      res.json(turnos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar todos os turnos.' });
    }
  }

  // Relatório de tempo por setor de um usuário
  async relatorioUsuario(req, res) {
    try {
      const { nickname, dataDe, dataAte, setor } = req.query;
      if (!nickname) return res.status(400).json({ error: 'Nickname é obrigatório.' });
      const filtro = { nickname };
      if (dataDe || dataAte) {
        filtro.inicio = {};
        if (dataDe) filtro.inicio.$gte = new Date(dataDe);
        if (dataAte) filtro.inicio.$lte = new Date(dataAte);
      }
      if (setor) {
        if (Array.isArray(setor)) {
          filtro['setores.nome'] = { $in: setor };
        } else {
          filtro['setores.nome'] = setor;
        }
      }
      const turnos = await ServicePoint.find(filtro);
      // Agrupar tempo por setor
      const tempoPorSetor = {};
      let totalMin = 0;
      turnos.forEach(turno => {
        (turno.setores || []).forEach(s => {
          if (!s.inicio) return;
          const fim = s.fim ? new Date(s.fim) : (turno.fim ? new Date(turno.fim) : new Date());
          const min = Math.max(0, Math.floor((fim - new Date(s.inicio)) / 60000));
          if (!tempoPorSetor[s.nome]) tempoPorSetor[s.nome] = 0;
          tempoPorSetor[s.nome] += min;
          totalMin += min;
        });
      });
      res.json({ setores: tempoPorSetor, total: totalMin });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao gerar relatório.' });
    }
  }

  // Ranking semanal de horas de turno
  async rankingSemanal(req, res) {
    try {
      let { inicio, fim } = req.query;
      // Ajuste para garantir cálculo no fuso de Brasília (UTC-3)
      const agora = new Date();
      // Ajusta para UTC-3 (Brasília)
      const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000);
      const day = brasilia.getDay();
      const diffToMonday = brasilia.getDate() - day + (day === 0 ? -6 : 1);
      const mondayBrasilia = new Date(brasilia.setDate(diffToMonday));
      mondayBrasilia.setHours(0,0,0,0);
      // Volta para UTC+0
      const inicioSemana = new Date(mondayBrasilia.getTime() + 3 * 60 * 60 * 1000);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 6);
      fimSemana.setHours(23,59,59,999);
      if (!inicio) inicio = inicioSemana.toISOString();
      if (!fim) fim = fimSemana.toISOString();
      // Busca apenas turnos iniciados dentro do período da semana em UTC-3
      const turnos = await ServicePoint.find({ inicio: { $gte: new Date(inicio), $lte: new Date(fim) } });
      // Soma o tempo de cada usuário
      const tempoPorUsuario = {};
      turnos.forEach(turno => {
        let totalMin = 0;
        (turno.setores || []).forEach(s => {
          if (!s.inicio) return;
          let setorInicio = new Date(s.inicio);
          let setorFim;
          if (s.fim) {
            setorFim = new Date(s.fim);
          } else if (turno.fim) {
            setorFim = new Date(turno.fim);
          } else {
            setorFim = new Date();
          }
          // Só conta o tempo do setor inteiro, pois o turno já está filtrado pelo início
          const min = Math.max(0, Math.floor((setorFim - setorInicio) / 60000));
          totalMin += min;
        });
        if (!tempoPorUsuario[turno.nickname]) tempoPorUsuario[turno.nickname] = 0;
        tempoPorUsuario[turno.nickname] += totalMin;
      });
      // Ordena e pega top 10
      const ranking = Object.entries(tempoPorUsuario)
        .map(([nick, min]) => ({ 
          nick, 
          horas: Math.floor(min / 60),
          minutos: min % 60,
          totalMinutos: min // Adicionado para ordenação precisa
        }))
        .sort((a, b) => b.totalMinutos - a.totalMinutos) // Ordena por minutos totais
        .slice(0, 10) // Pega apenas os top 10
        .map(({ nick, horas, minutos }) => ({ nick, horas, minutos })); // Remove totalMinutos do resultado
      res.json(ranking);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao gerar ranking.' });
    }
  }
}

export default new ServicePointController(); 