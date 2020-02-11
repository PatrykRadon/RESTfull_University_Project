<?php
    	
require '../vendor/autoload.php' ;        
require_once("rest.php");
require_once("mongo.php");
	
class API extends REST {
	
	public $data = "";
	
	public function __construct(){
		parent::__construct();		// Init parent contructor
              $this->db = new db() ;             // Initiate Database
	}
			
	public function processApi(){

		$func = "_".$this->_endpoint ; 
		if((int)method_exists($this,$func) > 0) {
		    $this->$func();
              }  else {
		    $this->response('Page not found',404); }			
    }
    

    private function _list(){   
        if($this->get_request_method() != "GET"){
            $this->response('',406);
        }
        try{
            $result = $this->db->select();            
            $this->response($this->json($result), 200); 
        } 
        catch (Exception $e) {
            $this->response('', 400);
        }
    }
		

	private function _register(){
        
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status' => 'failed', 'msg' => 'data missed');
                        $this->response($this->json($result), 400);
                    }
                }
                $res = $this->db->register($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } 
                else {
                    $result = array('status' => 'login already taken');
                    $this->response($this->json($result), 200);
                }    
            } 
            catch (Exception $e) {
                $error = array('status' => "failed", "msg" => "exception thrown");
                $this->response('', 400);
            }
        } 
        else {
            $error = array('status' => "failed", "msg" => "invalid send data");
            $this->response($this->json($error), 400);
        }
    }

	private function _session(){
        if($this->get_request_method() != "POST")
            $this->response('',406);

        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status'=>'failed', 'msg' => 'data missed');
                        $this->response($this->json($result), 400);
                    }
                }
                $res = $this->db->session($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } 
                else{
                    $result = array('status' => 'invalid session');
                    $this->response($this->json($result), 200);
                } 
            } 
            catch (Exception $e){
                $error = array('status' => "failed", "msg" => "exception thrown");
                $this->response('', 400);
            }
        } 
        else {
            $error = array('status' => "Failed", "msg" => "invalid send data");
            $this->response($this->json($error), 400);
        } 

    }

	private function _login(){
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status' => 'failed', 'msg' => 'data missed');
                        $this->response($this->json($result), 400);
                    }
                }
                    
                $res = $this->db->login($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok', 'sessionID'=>$res);
                    $this->response($this->json($result), 200);
                } 
                else {
                    $result = array('status'=>'validation fail');
                    $this->response($this->json($result), 200);
                } 
            } 
            catch (Exception $e) {
                $error = array('status' => "failed", "msg" => "exception thrown");
                $this->response('', 400);
            }
        } 
        else {
            $error = array('status' => "failed", "msg" => "invalid send data");
            $this->response($this->json($error), 400);
        }   
    }

    private function _save(){
        if($this->get_request_method() != "POST")
            $this->response('',406);

        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status'=>'failed', 'msg' => 'data missed');
                        $this->response($this->json($result), 400);
                    }
                }

                                   
                $res = $this->db->insert($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } 
                else {
                    $result = array('status' => 'not add');
                    $this->response($this->json($result), 200);
                } 
            } 
            catch (Exception $e) {
                $error = array('status' => "failed", "msg" => "exception thrown");
                $this->response('', 400);
            }
        } 
        else {
            $error = array('status' => "failed", "msg" => "invalid send data");
            $this->response($this->json($error), 400);
        }   
    }

    

	private function json($data){
		if(is_array($data)){
			return json_encode($data);
		}
    }
    
    private function _logout(){
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!empty($this->_request)){
            try{
                $json_array = json_decode($this->_request,true);
                $res = $this->db->logout($json_array['sessionID']) ;            
                if ( $res ){
                    $result = array('status'=>'ok');
                    $this->response($this->json($result), 200);
                } 
                else {
                    $result = array('status'=>'wrong sessionID');
                    $this->response($this->json($result), 200);
                } 
            } 
            catch (Exception $e) {
                $this->response('', 400) ;
            }  
        }
        else{
            $error = array('status' => "failed", "msg" => "session failed");
            $this->response($this->json($error), 400);
        } 
    }





}
		
	$api = new API;
	$api->processApi();

?>

