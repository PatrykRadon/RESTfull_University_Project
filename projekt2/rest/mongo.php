<?php
  
class db {
    private $user = "7radon" ;
    private $pass = "pass7radon";
    private $host = "172.20.44.25";
    private $base = "7radon";
    private $coll = "user";
    private $collSession = "sesja";
    private $collPogoda = "pogoda";
    private $conn;
    private $collection;
    private $UserColl;
    private $SessionColl;
    private $PogodaColl;
  
    function __construct() {
      $this->conn = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");    
      $this->UserColl = $this->conn->{$this->base}->{$this->coll};
      $this->SessionColl= $this->conn->{$this->base}->{$this->collSession};
      $this->PogodaColl= $this->conn->{$this->base}->{$this->collPogoda};
    }
 
    function select() {
      $cursor = $this->PogodaColl->find();
      $table = iterator_to_array($cursor);
      return $table ;
    }
 

    function register($user){
      $count = $this->UserColl->count(['username' => $user['username']]);
      if($count==0){
          $ret = $this->UserColl->insertOne($user);
       }
        return $ret;
    }

    public function login($array){
      $name = $array['username'];
      $pass = $array['password'];
      $count =  $this->UserColl->count(['username' => $name, 'password' => $pass]);
      if($count == 0)
        $ret = false;
      else{
        //zakodowanie sesji
        $sess_id = md5(uniqid($name, true));
        $start_time = date('Y-m-d H:i:s', time());
        $record = array('sessionID' => $sess_id,'start' => $start_time);
        $ret = $this->SessionColl->insertOne($record);
      }
      return $sess_id;
    }


    function session($arr) {
        $tmp =  $this->SessionColl->findOne(array('sessionID' => $arr['sessionID']));
        if($tmp != NULL){
          $start_time = $tmp['start'];
          $date = DateTime::createFromFormat("Y-m-d H:i:s", $start_time);
          $current_time = new DateTime('now');
          $diff = $current_time->getTimestamp() - $date->getTimestamp();
          if($diff > (10*60))
          {
            $this->SessionColl->remove(array('sessionID' => $arr['sessionID']));
            return false;
          }
        }
        else{
          return false;
        }
        return true;
      }

      public function logout($sess){
        $tmp =  $this->SessionColl->find(array('sessionID' => $sess));
        if($tmp != NULL){
          $this->SessionColl->deleteOne(array('sessionID' => $sess));
          return true;
        }
        else
          return false;
       
      }

      function insert($data) {
        $ret = $this->PogodaColl->insertOne($data);
        return $ret;
      }
 
 
}
