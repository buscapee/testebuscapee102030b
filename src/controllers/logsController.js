import { Logger } from '../Models/logsModel.js';
import { User } from '../Models/useModel.js';

export default class ServiceControllerLogger{
    //Função responsável por criar a equioe
    async getAllLogs(req, res){
      try {
        const $nickname = req.query.nickname; // Nickname do usuário para filtrar (do frontend)
        const adminNickname = req.query.adminNickname; // Nickname do admin (para verificar permissão)
        const page = parseInt(req.query.page) || 1; // Número da página
        const limit = parseInt(req.query.limit) || 10; // Tamanho da página (itens por página)
        // const search = req.query.search; // Não usaremos 'search' para filtrar por usuário
        // console.log("search AQUI -> " + search)
        
        // Use adminNickname para verificar se o usuário é admin ou diretor
        const admin = await User.findOne({ nickname: adminNickname });
        let logs;
        let totalLogs;
    
        if (!admin || (admin.userType !== "Admin" && admin.userType !== "Diretor")) {
          return res.status(404).json({ msg: 'Ops! Parece que você não é um administrador ou diretor.' });
        }
    
        const filter = {};
        if ($nickname) {
          filter.user = $nickname; // Filtra os logs pelo campo 'user' igual ao $nickname
          // Calcule o número de documentos a pular SOMENTE SE houver filtro de nickname
          const skip = Math.max(0, (page - 1) * limit);

          // Encontre os logs com paginação e filtro por nickname
          logs = await Logger.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
          totalLogs = await Logger.countDocuments(filter);
        } else {
          // Encontre TODOS os logs se não houver filtro de nickname
          logs = await Logger.find(filter).sort({ createdAt: -1 }); // Remove .skip() e .limit()
          totalLogs = await Logger.countDocuments(filter);
        }
    
        return res.json({
          logs,
          currentPage: page,
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs
        });
    
      } catch (error) {
        console.error('Erro ao buscar logs', error);
        res.status(500).json({ msg: 'Erro ao buscar logs' });
      }
    };

    async getDuplicatedIPs(req, res) {
      try {
        const adminNickname = req.query.adminNickname;
        const admin = await User.findOne({ nickname: adminNickname });
        if (!admin || (admin.userType !== "Admin" && admin.userType !== "Diretor")) {
          return res.status(404).json({ msg: 'Ops! Parece que você não é um administrador ou diretor.' });
        }
        // Agrupa por IP e conta usuários distintos por IP
        const duplicatedIPs = await Logger.aggregate([
          {
            $group: {
              _id: "$ip",
              users: { $addToSet: "$user" },
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              ip: "$_id",
              total: { $size: "$users" },
              count: 1
            }
          },
          {
            $match: {
              total: { $gt: 1 }
            }
          },
          {
            $sort: { total: -1 }
          }
        ]);
        return res.json({ duplicatedIPs });
      } catch (error) {
        console.error('Erro ao buscar IPs duplicados', error);
        res.status(500).json({ msg: 'Erro ao buscar IPs duplicados' });
      }
    }

    // Nova função para retornar todos os IPs de login dos usuários
    async getAllIps(req, res) {
      try {
        const adminNickname = req.query.adminNickname;
        const admin = await User.findOne({ nickname: adminNickname });
        if (!admin || (admin.userType !== "Admin" && admin.userType !== "Diretor")) {
          return res.status(404).json({ msg: 'Ops! Parece que você não é um administrador ou diretor.' });
        }
        // Busca todos os logs agrupados por usuário
        const logs = await Logger.find({});
        const userIps = {};
        logs.forEach(log => {
          if (!userIps[log.user]) userIps[log.user] = [];
          if (!userIps[log.user].includes(log.ip)) userIps[log.user].push(log.ip);
        });
        // Transforma em array de objetos
        const result = Object.entries(userIps).map(([nickname, ips]) => ({ nickname, ips }));
        return res.json(result);
      } catch (error) {
        console.error('Erro ao buscar IPs', error);
        res.status(500).json({ msg: 'Erro ao buscar IPs' });
      }
    }
};
