import express from "express"
import ServiceControllerUser from "../controllers/userController.js";
import { authGuard } from "../Middleware/authGuard.js";

const UserRouter = express.Router();
const serviceControllerUser = new ServiceControllerUser();

UserRouter.route('/login').post((req, res) => serviceControllerUser.login(req, res))
UserRouter.route('/users/update').put((req, res) => serviceControllerUser.updateUser(req, res))
UserRouter.route('/logout').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerUser.logoutPass(req, res))
UserRouter.route('/all/users').get((req, res) => serviceControllerUser.getAll(req, res))

// Rotas privadas 
//UserRouter.route('/all/users').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => serviceControllerUser.getAll(req, res))
UserRouter.route('/user/delete/:userId').delete(authGuard(['Admin']),(req, res) => serviceControllerUser.deleteUsers(req, res))
UserRouter.route('/profile').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), serviceControllerUser.getcurrentUser, (req, res) => serviceControllerUser.getAll(req, res));
UserRouter.route('/search').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerUser.searchUser(req, res));
UserRouter.route('/admin/update').put(authGuard(['Admin']),(req, res) => serviceControllerUser.updateUserAdmin(req, res))
UserRouter.route('/update/tag').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerUser.createTag(req, res));
UserRouter.route('/permissions').get(authGuard(['Admin']),(req, res) => serviceControllerUser.permissions(req, res));
UserRouter.route('/users/location').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerUser.updateLocation(req, res));
UserRouter.route('/change-password').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerUser.changePassword(req, res));
UserRouter.route('/coins-history/:id').get(authGuard(['Admin']), (req, res) => serviceControllerUser.getCoinsHistory(req, res));

UserRouter.route('/dev/create-user').post(async (req, res) => {
  try {
    const { nick, password, patent, userType } = req.body;
    if (!nick || !password) {
      return res.status(400).json({ error: 'nick e password são obrigatórios' });
    }
    const bcrypt = (await import('bcryptjs')).default;
    const { User } = await import('../Models/useModel.js');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { nickname: nick },
      {
        nickname: nick,
        password: passwordHash,
        patent: patent || "Administrador",
        classes: ["Instrução Inicial [INS]"],
        teans: ["System"],
        status: "Ativo",
        tag: "Vazio",
        warnings: 0,
        medals: 0,
        userType: userType || "Admin"
      },
      { upsert: true, new: true }
    );
    res.json({ msg: "Usuário criado/atualizado com sucesso!", user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

UserRouter.route('/me/emblemas').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findById(req.idUser).populate({
      path: 'emblemas',
      model: 'ShopProduct',
      select: 'name image description category isEmblem',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.emblemas || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emblemas.' });
  }
});

// Nova rota para buscar emblemas de um usuário específico
UserRouter.route('/emblemas/:nickname').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findOne({ nickname: req.params.nickname }).populate({
      path: 'emblemas',
      model: 'ShopProduct',
      select: 'name image description category isEmblem',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.emblemas || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emblemas.' });
  }
});

// Atualizar emblemas exibidos no perfil
UserRouter.route('/me/emblemas-exibidos').put(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { emblemasExibidos } = req.body;
    const { User } = await import('../Models/useModel.js');
    const user = await User.findById(req.idUser);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    user.emblemasExibidos = emblemasExibidos || [];
    await user.save();
    res.json({ success: true, emblemasExibidos: user.emblemasExibidos });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar emblemas exibidos.' });
  }
});

// Buscar emblemas exibidos do usuário logado
UserRouter.route('/me/emblemas-exibidos').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findById(req.idUser).populate({
      path: 'emblemasExibidos',
      model: 'ShopProduct',
      select: 'name image description category isEmblem',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.emblemasExibidos || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emblemas exibidos.' });
  }
});

// Buscar emblemas exibidos de qualquer usuário por nickname
UserRouter.route('/emblemas-exibidos/:nickname').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findOne({ nickname: req.params.nickname }).populate({
      path: 'emblemasExibidos',
      model: 'ShopProduct',
      select: 'name image description category isEmblem',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.emblemasExibidos || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emblemas exibidos.' });
  }
});

// Buscar banners comprados pelo usuário logado
UserRouter.route('/me/banners').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const { default: ShopProduct } = await import('../Models/ShopProduct.js');
    const user = await User.findById(req.idUser);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    // Buscar todos os produtos do tipo banner que o usuário comprou
    const banners = await ShopProduct.find({ _id: { $in: user.emblemas }, isBanner: true });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar banners.' });
  }
});

// Atualizar banners exibidos no perfil
UserRouter.route('/me/banners-exibidos').put(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { bannersExibidos } = req.body;
    const { User } = await import('../Models/useModel.js');
    const user = await User.findById(req.idUser);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    user.bannersExibidos = bannersExibidos || [];
    await user.save();
    res.json({ success: true, bannersExibidos: user.bannersExibidos });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar banners exibidos.' });
  }
});

// Buscar banners exibidos do usuário logado
UserRouter.route('/me/banners-exibidos').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findById(req.idUser).populate({
      path: 'bannersExibidos',
      model: 'ShopProduct',
      select: 'name image description category isBanner',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.bannersExibidos || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar banners exibidos.' });
  }
});

// Buscar banners exibidos de qualquer usuário por nickname
UserRouter.route('/banners-exibidos/:nickname').get(authGuard(['User', 'Admin', 'Diretor', 'Recursos Humanos']), async (req, res) => {
  try {
    const { User } = await import('../Models/useModel.js');
    const user = await User.findOne({ nickname: req.params.nickname }).populate({
      path: 'bannersExibidos',
      model: 'ShopProduct',
      select: 'name image description category isBanner',
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user.bannersExibidos || []);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar banners exibidos.' });
  }
});

export default UserRouter;