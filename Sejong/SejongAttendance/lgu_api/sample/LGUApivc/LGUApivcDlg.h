// LGUApivcDlg.h : header file
//
//{{AFX_INCLUDES()
#include "lgubaseopenapi.h"
//}}AFX_INCLUDES

#if !defined(AFX_LGUAPIVCDLG_H__1F1E8D26_FCF0_4A77_9D2A_D54F2E2FD780__INCLUDED_)
#define AFX_LGUAPIVCDLG_H__1F1E8D26_FCF0_4A77_9D2A_D54F2E2FD780__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

/////////////////////////////////////////////////////////////////////////////
// CLGUApivcDlg dialog

class CLGUApivcDlg : public CDialog
{
// Construction
public:
	CLGUApivcDlg(CWnd* pParent = NULL);	// standard constructor
CString m_strLogBoxStr;
// Dialog Data
	//{{AFX_DATA(CLGUApivcDlg)
	enum { IDD = IDD_LGUAPIVC_DIALOG };
	CEdit	m_ctlLogBox;
	CString	m_strLoginID;
	CString	m_strLoginDomain;
	CString	m_strLoginPW;
	CString	m_strTransNum;
	CString	m_strNotifyPeers;
	CString	m_strNotifyMsg;
	CString	m_strPeerInfos;
	CString	m_strCallNum;
	CString	m_strSmsMsg;
	CString	m_strSmsNums;
	CString	m_strUserInfoVal;
	CString	m_strConfInvPeer;
	CString	m_strHistoryEnd;
	CString	m_strHistoryStart;
	CString	m_strForwardStart;
	CString	m_strForwardNum;
	CString	m_strForwardEnd;
	CString	m_strUserInfoCombo;
	CString	m_strForwardCombo;
	CString	m_strHistoryCatCombo;
	CString	m_strHistoryInoutCombo;
	CString	m_strHistorySearchCombo;
	CLGUBaseOpenApi	m_ctlOCX;
	CString	m_strCallWithConf;
	//}}AFX_DATA

	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CLGUApivcDlg)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);	// DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:
	HICON m_hIcon;
	void SetLogBox(CString msg) ;
	// Generated message map functions
	//{{AFX_MSG(CLGUApivcDlg)
	virtual BOOL OnInitDialog();
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();
	afx_msg void OnLoginBtn();
	afx_msg void OnClick2callBtn();
	afx_msg void OnAnswerBtn();
	afx_msg void OnHangupBtn();
	afx_msg void OnAtxferBtn();
	afx_msg void OnSendNotifyBtn();
	afx_msg void OnByeBtn();
	afx_msg void OnPickupBtn();
	afx_msg void OnRejectBtn();
	afx_msg void OnHangupBtn2();
	afx_msg void OnHoldBtn();
	afx_msg void OnUnholdBtn();
	afx_msg void OnSrecordBtn();
	afx_msg void OnErecordBtn();
	afx_msg void OnTransBtn();
	afx_msg void OnConfBtn();
	afx_msg void OnConfinvBtn();
	afx_msg void OnPeerinfosBtn();
	afx_msg void OnSendSmsBtn();
	afx_msg void OnUserinfoBtn();
	afx_msg void OnForwardSetBtn();
	afx_msg void OnForwardClearBtn();
	afx_msg void OnHistoryBtn();
	afx_msg void OnSendLoginResultEventLgubaseopenapictrl1(BSTR FAR* bstrLoginResult);
	afx_msg void OnSendRingEventLgubaseopenapictrl1(BSTR FAR* bstrRingEvent);
	afx_msg void OnSendChannelListEventLgubaseopenapictrl1(BSTR FAR* bstrChannelList);
	afx_msg void OnSendChannelOutEventLgubaseopenapictrl1(BSTR FAR* bstrChannelOut);
	afx_msg void OnSendNetworkErrorEventLgubaseopenapictrl1();
	afx_msg void OnSendCommandResultEventLgubaseopenapictrl1(BSTR FAR* bstrCommandResult);
	afx_msg void OnSendSMSEventLgubaseopenapictrl1(BSTR FAR* bstrSMSValue);
	afx_msg void OnSendPeerMsgEventLgubaseopenapictrl1(BSTR FAR* bstrMsgValue);
	afx_msg void OnSendDtmfEventLgubaseopenapictrl1(BSTR FAR* bstrMsgValue);
	afx_msg void OnSendCmdErrorEventLgubaseopenapictrl1(BSTR FAR* bstrEventName, BSTR FAR* bstrMsgValue);
	afx_msg void OnSendEtcEventLgubaseopenapictrl1(BSTR FAR* bstrEventName, BSTR FAR* bstrEventValue);
	afx_msg void OnReadyStateChangeLgubaseopenapictrl1();
	afx_msg void OnPeerstatusBtn2();
	afx_msg void OnCallwithconf();
	DECLARE_EVENTSINK_MAP()
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_LGUAPIVCDLG_H__1F1E8D26_FCF0_4A77_9D2A_D54F2E2FD780__INCLUDED_)
