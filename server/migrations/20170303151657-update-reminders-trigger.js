'use strict';
module.exports = {
  up: function(migration, DataTypes) {
  return migration.sequelize.query(
'CREATE TRIGGER log_update_reminder ' +
 ' AFTER UPDATE ' +
  ' ON public."Reminders" ' +
  ' FOR EACH ROW ' +
  ' EXECUTE PROCEDURE public.log_new_reminder();'
 )}
};
