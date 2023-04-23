'use strict';

class Collection {
  constructor(model) {
    this.model = model;
  };

  async create(obj, next) {
    try {
      return await this.model.create(obj);
    } catch (error) {
      console.error(error);
      console.error(error.message);
      if (error.message == 'Validation error' && error?.errors[0]?.message == 'phoneNumber must be unique') {
      next('Phone Number already exists!');
        
      }
      console.error('can not create a new record on ', this.model.name, 'ERROR: ', error?.errors[0]?.message ?? 'create new record error');
      next(error?.errors[0]?.message ?? 'create new record error');
    }
  };

  async read(key, value) {
    try {
      let record = null;
      if (key && value) {
        record = await this.model.findAll({ where: {[key]: value}, order: [ ['updatedAt', 'DESC'] ] });
      } else {
        record = await this.model.findAll({order: [ ['updatedAt', 'DESC'] ]});
      }
      return record;
    } catch (error) {
      console.error('can not read the record/s on ', this.model.name, ` where id=${id}`, 'ERROR: ', error?.errors[0]?.message ?? 'read record/s error');
      next(error?.errors[0]?.message ?? 'read record/s error');

    }
  };

  async update(id, obj) {
    try {
      let currentRecord = await this.model.findOne({ where: { id } });
      let updatedRecord = await currentRecord.update(obj);
      return updatedRecord;
    } catch (error) {
      console.error(' can not update the record on ', this.model.name, ` where is id=${id}`, 'ERROR: ', error?.errors[0]?.message ?? 'update record error');
      next(error?.errors[0]?.message ?? 'update record error');

    }
  };

  async delete(id) {
    if (!id) {
      throw new Error('no id provided !, for model ', this.model.name);
    }
    try {
      let deleteRecord = await this.model.destroy({ where: { id } });
      return deleteRecord;
    } catch (error) {
      console.error(' can not delete the record on ', this.model.name, ` where is id=${id}`, 'ERROR: ', error?.errors[0]?.message ?? 'delete record error');
      next(error?.errors[0]?.message ?? 'delete record error');
    }
  };
};

module.exports = Collection;
