import { Images } from "../Models/imagesModel.js";

export default class ServiceControllerImages {
    async created(req, res) {
        try {
            const $data = req.body.data;

            const images = await Images.findOne();

            if (images) {
                return res.status(422).json({ error: 'Já existe uma configuração, faça o update' });
            }

            const newImages = {
                imageOne: $data.imageOne ? $data.imageOne : 'vazio',
                imageTwo: $data.imageTwo ? $data.imageTwo : 'vazio',
                imageThree: $data.imageThree ? $data.imageThree : 'vazio',
                imageFour: $data.imageFour ? $data.imageFour : 'vazio',
            }

            const create = await Images.create(newImages)

            if (!create) {
                return res.status(422).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' })
            }

            res.status(201).json({ msg: 'Slide criado com sucesso' })

        } catch (error) {
            console.error(error)
        }
    }

    async get(req, res) {
        try {
            const images = await Images.findOne();
                
            if (images) {
                return res.json(images);
            }

            return res.status(404).json({ error: 'Não existe nenhuma imagem' });

        } catch (error) {
            console.error('Erro ao buscar logs', error);
            res.status(500).json({ msg: 'Erro ao buscar logs' });
        }
    }

    async update(req, res) {
        try {
            const $data = req.body.data;

            const images = await Images.findOne();
            const updatedImages = {
                imageOne: $data.imageOne ? $data.imageOne : 'vazio',
                imageTwo: $data.imageTwo ? $data.imageTwo : 'vazio',
                imageThree: $data.imageThree ? $data.imageThree : 'vazio',
                imageFour: $data.imageFour ? $data.imageFour : 'vazio',
            }

            const updatedImage = await Images.findOneAndUpdate(
                { _id: images._id },
                updatedImages,
                { new: true }
            );

            if (!updatedImage) {
                return res.status(404).json({ error: 'Imagem não encontrada para atualização.' });
            }


            res.status(200).json({ msg: 'Slide atualizado com sucesso', updatedImage });

        } catch (error) {
            console.error('Erro ao atualizar a imagem', error);
            res.status(500).json({ msg: 'Erro ao atualizar a imagem' });
        }
    }
}


