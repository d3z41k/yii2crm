<?php

namespace frontend\controllers;

use Yii;
use frontend\controllers\SocketIO;
use app\models\Clients;
use app\models\ClientsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use common\models\User;

/**
 * ClientsController implements the CRUD actions for Clients model.
 */
class ClientsController extends Controller
{
    public function behaviors()
    {
        return [

        'access' => [
                'class' => AccessControl::className(),
                'only' => ['index', 'clients'],
                'rules' => [
                    [
                   'actions' => ['index'],
                   'allow' => true,
                   'roles' => ['@'],
                   // 'matchCallback' => function ($rule, $action) {
                   //     return User::isUserUser(Yii::$app->user->identity->username);
                   //}
                    ],
                ],
            ],

            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['post'],
                ],
            ],
        ];
    }

    /**
     * Lists all Clients models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new ClientsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        //"костыль"
        $socketio = new SocketIO();
        $socketio->send('localhost', 9090, 'message', '');

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);   
    }

    public function actionView($id)
    {	
        $socketio = new SocketIO();
        //$socketio->send('localhost', 9090, 'message', Yii::$app->user->identity->username .' @ view | id = '. $id);
        $msg = array(
            'uname' => Yii::$app->user->identity->username,
            'tmsg' => Yii::$app->user->identity->username .' @ view | id = '. $id
        );
        $socketio->send('localhost', 9090, 'message', json_encode($msg));
    
        return $this->render('view', [
            'model' => $this->findModel($id),
        ]);
    }

    public function actionCreate()
    {
        $model = new Clients();
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            
        $socketio = new SocketIO();
        //$socketio->send('localhost', 9090, 'message', Yii::$app->user->identity->username .' @ create | id = '. $model->id);
        $msg = array(
            'uname' => Yii::$app->user->identity->username,
            'tmsg' => Yii::$app->user->identity->username .' @ create | id = '. $model->id
        );
        $socketio->send('localhost', 9090, 'message', json_encode($msg));

            return $this->redirect(['index']);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $n_name = $model->name;
        $n_surname = $model->surname;
        $n_email = $model->email;
        $n_age = $model->age;
        $n_born = $model->born;
		$message = '';
 
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
		
		if ($model->name != $n_name)
			$message .= '[name]';
		if ($model->surname != $n_surname)
			$message .='[surname]';
		if ($model->email != $n_email)
			$message .='[email]';
		if ($model->age != $n_age)
			$message .='[age]';
		if ($model->born != $n_born)
			$message .='[born]';	

        $socketio = new SocketIO();
        //$socketio->send('localhost', 9090, 'message', Yii::$app->user->identity->username .' @ update | id = '. $model->id.' '.$message);

        $msg = array(
            'uname' => Yii::$app->user->identity->username,
            'tmsg' => Yii::$app->user->identity->username .' @ update | id = '. $model->id.' '.$message
        );
        $socketio->send('localhost', 9090, 'message', json_encode($msg));

            return $this->redirect(['index']);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        $socketio = new SocketIO();
        //$socketio->send('localhost', 9090, 'message', Yii::$app->user->identity->username .' @ delete | id = '. $id);

        $msg = array(
            'uname' => Yii::$app->user->identity->username,
            'tmsg' => Yii::$app->user->identity->username .' @ delete | id = '. $id
        );
        $socketio->send('localhost', 9090, 'message', json_encode($msg));

        return $this->redirect(['index']);
    }

    protected function findModel($id)
    {
        if (($model = Clients::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
