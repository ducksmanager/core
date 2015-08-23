<?php
class DatabasePriv {
	static $profils;
	static $profil_courant = 'coa';
	static $ip_serveur_virtuel = 'my_ip';
	
	static function connect($db=null) {
		self::$profils=array(
			self::$profil_courant => new ProfilDB('localhost','root','my_password')
		);

		return self::$profils[self::$profil_courant]->connexion($db);
	}
	
	static function getProfil($nom_profil) {
		return self::$profils[$nom_profil];
	}
	
	static function getProfilCourant() {
		return self::getProfil(self::$profil_courant);
	}
	
	static function verifPassword($password) {
		return sha1(self::getProfilCourant()->password) == $password;
	}
}

class ProfilDB {
	var $server;
	var $user;
	var $password;
	
	function ProfilDB($server,$user,$password) {
		$this->server=$server;
		$this->user=$user;
		$this->password=$password;
	}
	
	function connexion($db) {
		if (!$this->server) return;
		if (!$idbase = @mysql_pconnect($this->server, $this->user, $this->password))
			return false;
		$database=is_null($db) ? DatabasePriv::$nom_db_DM : $db;
		if (!mysql_select_db($database))
			return false;
		return true;
	}
}
