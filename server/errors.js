/*
*  Статусы/коды ошибок и сообщений
*/
var check = require('validator').check;
module.exports = {
  //REST error:
  //Все ОК
  restStat_isOk                      : 200,
  //попытка сериализации данных для неавторизованного пользователя
  restStat_NoAutorisationUser        : 401,
  restMess_NoAutorisationUser        : 'Пользователь не зарегистрирован',
	//пользователь не найден в БД
	restStat_UserNotFound              : 432,
	restMess_UserNotFound              : 'Пользователь с таким email не найден',
	//неудачная попытка валидации данных пользователя
	restStat_UserValidationError       : 433,
	restMess_UserPasswordIncorrect     : 'Неверный пароль пользователя',
	//неудачная попытка завести пользователя, такой уже существует
	restStat_UserExist                 : 434,
	restMess_UserExist                 : 'Такой пользователь уже зарегистрирован',
	//попытка сохранить данные в БД, с возникновением ошибки БД
	restStat_DbSaveError               : 435,
	restMess_DbSaveError               : 'Невозможно сохранить данные в DB',
	//неудачная попытка прочитать данные из БД
	restStat_DbReadError               : 436,
	restMess_DbReadError               : 'Невозможно прочитать данные из DB',
	//неудачная попытка обработать файл изображения
	restMess_ImgErr                    : { status:'error' },
	//удачная попытка обработать файл изображения
	restMess_ImgOk                     : { status:'server' },
	//перевод ошибок Монги во внутренние проблемы
	translateMongoError: function(error) {
	  var ret = { status: this.restStat_DbSaveError, message: this.restMess_DbSaveError + ' ' + error.message };
	  
	  return ret;
	},
  validateUser: function(user) {
    var ret = { status: this.restStat_isOk, message: '' };
    try {
      check(user.username, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
      check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
      //^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$
      check(user.email, 'Пожалуйста введите корректный email').len(4,64).isEmail();
    } catch (e) {
      ret.status = this.restStat_UserValidationError;
      ret.message = e.message;
    }
    
    return ret;
  },
};
//432 - Autorization error
//434 - User not found