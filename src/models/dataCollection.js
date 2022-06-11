'use strict';

class Collection {
  constructor(model) {
    this.model = model;
  }

  async create(obj) {
    try {
      return await this.model.create(obj);
    } catch (error) {
      console.log(error);
      console.error('can not create a new record on ', this.model.name);
    }
  }

  async read(id) {
    try {
      let record = null;
      if (id) {
        record = await this.model.findAll({ where: { userId: id } });
      } else {
        record = await this.model.findAll();
      }
      return record;
    } catch (error) {
      console.error('can not read the record/s on ', this.model.name, ` where id=${id}`);
    }
  }

  async update(id, obj) {
    try {
      let currentRecord = await this.model.findOne({ where: { id } });
      let updatedRecord = await currentRecord.update(obj);
      return updatedRecord;
    } catch (error) {
      console.error(' can not update the record on ', this.model.name, ` where is id=${id}`);
    }
  }

  async delete(id) {
    if (!id) {
      throw new Error('no id provided !, for model ', this.model.name);
    }
    try {
      let deleteRecord = await this.model.destroy({ where: { id } });
      return deleteRecord;
    } catch (error) {
      console.error(' can not delete the record on ', this.model.name, ` where is id=${id}`);
    }
  }
}

module.exports = Collection;
