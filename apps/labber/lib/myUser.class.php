<?php

class myUser extends sfGuardSecurityUser
{
  /**
   * Ritorna true se l'utente è transreparto.
   *
   * @return boolean
   */
  public function isInterdepartmental()
  {
    return ($this->hasCredential('admin') || $this->hasPermission('trans'));
  }
  
  public function getFullName()
  {
    return $this->getProfile()->getName() .
    ' ' .
    $this->getProfile()->getSurname();
  }
}
