'use strict';
module.exports = {
  up: function(migration, DataTypes) {
  return migration.sequelize.query(
'CREATE OR REPLACE FUNCTION public.log_new_reminder()'+
'RETURNS trigger AS' +
' $BODY$ ' +
'BEGIN ' +
' INSERT INTO public."Messages" ("type", "status", "fromUserId", "toUserId", "assetId", "createdAt", "updatedAt")' +
'VALUES(5, 1, NEW."fromUserId", NEW."toUserId" ,NEW."assetId", now(), now());' +
'RETURN NEW;' +
'END;' +
'$BODY$' +
  'LANGUAGE plpgsql VOLATILE ' +
  ' COST 100;' +
'ALTER FUNCTION public.log_new_reminder()' +
  'OWNER TO postgres;'
 )}
};
