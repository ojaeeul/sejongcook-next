// LGUApivcDlg.cpp : implementation file
//

#include "stdafx.h"
#include "LGUApivc.h"
#include "LGUApivcDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CAboutDlg dialog used for App About

class CAboutDlg : public CDialog
{
public:
	CAboutDlg();

// Dialog Data
	//{{AFX_DATA(CAboutDlg)
	enum { IDD = IDD_ABOUTBOX };
	//}}AFX_DATA

	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CAboutDlg)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:
	//{{AFX_MSG(CAboutDlg)
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialog(CAboutDlg::IDD)
{
	//{{AFX_DATA_INIT(CAboutDlg)
	//}}AFX_DATA_INIT
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(CAboutDlg)
	//}}AFX_DATA_MAP
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialog)
	//{{AFX_MSG_MAP(CAboutDlg)
		// No message handlers
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CLGUApivcDlg dialog

CLGUApivcDlg::CLGUApivcDlg(CWnd* pParent /*=NULL*/)
	: CDialog(CLGUApivcDlg::IDD, pParent)
{
	//{{AFX_DATA_INIT(CLGUApivcDlg)
	m_strLoginID = _T("07075993458");
	m_strLoginDomain = _T("");
	m_strLoginPW = _T("1111");
	m_strTransNum = _T("");
	m_strNotifyPeers = _T("");
	m_strNotifyMsg = _T("");
	m_strPeerInfos = _T("");
	m_strCallNum = _T("");
	m_strSmsMsg = _T("");
	m_strSmsNums = _T("");
	m_strUserInfoVal = _T("");
	m_strConfInvPeer = _T("");
	m_strHistoryEnd = _T("");
	m_strHistoryStart = _T("");
	m_strForwardStart = _T("");
	m_strForwardNum = _T("");
	m_strForwardEnd = _T("");
	m_strUserInfoCombo = _T("");
	m_strForwardCombo = _T("");
	m_strHistoryCatCombo = _T("");
	m_strHistoryInoutCombo = _T("");
	m_strHistorySearchCombo = _T("");
	m_strCallWithConf = _T("");
	//}}AFX_DATA_INIT
	// Note that LoadIcon does not require a subsequent DestroyIcon in Win32
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
//	m_ctlUserInfoCombo.
}

void CLGUApivcDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(CLGUApivcDlg)
	DDX_Control(pDX, IDC_LOGBOX, m_ctlLogBox);
	DDX_Text(pDX, IDC_LOGIN_ID, m_strLoginID);
	DDX_Text(pDX, IDC_LOGIN_PW, m_strLoginPW);
	DDX_Text(pDX, IDC_TRNAS_NUM, m_strTransNum);
	DDX_Text(pDX, IDC_NOTIFY_PEERS, m_strNotifyPeers);
	DDX_Text(pDX, IDC_NOTIFY_MSG, m_strNotifyMsg);
	DDX_Text(pDX, IDC_PEERINFOS, m_strPeerInfos);
	DDX_Text(pDX, IDC_CALL_NUM, m_strCallNum);
	DDX_Text(pDX, IDC_SMS_MSG, m_strSmsMsg);
	DDX_Text(pDX, IDC_SMS_NUMS, m_strSmsNums);
	DDX_Text(pDX, IDC_USER_INFO_VAL, m_strUserInfoVal);
	DDX_Text(pDX, IDC_CONFINV_PEER, m_strConfInvPeer);
	DDX_Text(pDX, IDC_HISTORY_END, m_strHistoryEnd);
	DDX_Text(pDX, IDC_HISTORY_START, m_strHistoryStart);
	DDX_Text(pDX, IDC_FORWARD_START, m_strForwardStart);
	DDX_Text(pDX, IDC_FORWARD_NUM, m_strForwardNum);
	DDX_Text(pDX, IDC_FORWARD_END, m_strForwardEnd);
	DDX_CBString(pDX, IDC_USERINFO_COMBO, m_strUserInfoCombo);
	DDX_CBString(pDX, IDC_FORWARD_COMBO, m_strForwardCombo);
	DDX_CBString(pDX, IDC_HISTORY_CAT_COMBO, m_strHistoryCatCombo);
	DDX_CBString(pDX, IDC_HISTORY_INOUT_COMBO, m_strHistoryInoutCombo);
	DDX_CBString(pDX, IDC_HISTORY_SERCH_COMBO, m_strHistorySearchCombo);
	DDX_Control(pDX, IDC_LGUBASEOPENAPICTRL1, m_ctlOCX);
	DDX_Text(pDX, IDC_CALLWITHCONF_EDIT, m_strCallWithConf);
	//}}AFX_DATA_MAP
}

BEGIN_MESSAGE_MAP(CLGUApivcDlg, CDialog)
	//{{AFX_MSG_MAP(CLGUApivcDlg)
	ON_WM_SYSCOMMAND()
	ON_WM_PAINT()
	ON_WM_QUERYDRAGICON()
	ON_BN_CLICKED(IDC_LOGIN_BTN, OnLoginBtn)
	ON_BN_CLICKED(IDC_CLICK2CALL_BTN, OnClick2callBtn)
	ON_BN_CLICKED(IDC_ANSER_BTN, OnAnswerBtn)
	ON_BN_CLICKED(IDC_HANGUP_BTN, OnHangupBtn)
	ON_BN_CLICKED(IDC_ATXFER_BTN, OnAtxferBtn)
	ON_BN_CLICKED(IDC_SEND_NOTIFY_BTN, OnSendNotifyBtn)
	ON_BN_CLICKED(IDC_BYE_BTN, OnByeBtn)
	ON_BN_CLICKED(IDC_PICKUP_BTN, OnPickupBtn)
	ON_BN_CLICKED(IDC_REJECT_BTN, OnRejectBtn)
	ON_BN_CLICKED(IDC_HANGUP_BTN2, OnHangupBtn2)
	ON_BN_CLICKED(IDC_HOLD_BTN, OnHoldBtn)
	ON_BN_CLICKED(IDC_UNHOLD_BTN, OnUnholdBtn)
	ON_BN_CLICKED(IDC_SRECORD_BTN, OnSrecordBtn)
	ON_BN_CLICKED(IDC_ERECORD_BTN, OnErecordBtn)
	ON_BN_CLICKED(IDC_TRANS_BTN, OnTransBtn)
	ON_BN_CLICKED(IDC_CONF_BTN, OnConfBtn)
	ON_BN_CLICKED(IDC_CONFINV_BTN, OnConfinvBtn)
	ON_BN_CLICKED(IDC_PEERINFOS_BTN, OnPeerinfosBtn)
	ON_BN_CLICKED(IDC_SEND_SMS_BTN, OnSendSmsBtn)
	ON_BN_CLICKED(IDC_USERINFO_BTN, OnUserinfoBtn)
	ON_BN_CLICKED(IDC_FORWARD_SET_BTN, OnForwardSetBtn)
	ON_BN_CLICKED(IDC_FORWARD_CLEAR_BTN, OnForwardClearBtn)
	ON_BN_CLICKED(IDC_HISTORY_BTN, OnHistoryBtn)
	ON_BN_CLICKED(IDC_PEERSTATUS_BTN2, OnPeerstatusBtn2)
	ON_BN_CLICKED(IDC_CALLWITHCONF, OnCallwithconf)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CLGUApivcDlg message handlers

BOOL CLGUApivcDlg::OnInitDialog()
{
	CDialog::OnInitDialog();

	// Add "About..." menu item to system menu.

	// IDM_ABOUTBOX must be in the system command range.
	ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
	ASSERT(IDM_ABOUTBOX < 0xF000);

	CMenu* pSysMenu = GetSystemMenu(FALSE);
	if (pSysMenu != NULL)
	{
		CString strAboutMenu;
		strAboutMenu.LoadString(IDS_ABOUTBOX);
		if (!strAboutMenu.IsEmpty())
		{
			pSysMenu->AppendMenu(MF_SEPARATOR);
			pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
		}
	}

	// Set the icon for this dialog.  The framework does this automatically
	//  when the application's main window is not a dialog
	SetIcon(m_hIcon, TRUE);			// Set big icon
	SetIcon(m_hIcon, FALSE);		// Set small icon
	
	// TODO: Add extra initialization here
	
	return TRUE;  // return TRUE  unless you set the focus to a control
}

void CLGUApivcDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_ABOUTBOX)
	{
		CAboutDlg dlgAbout;
		dlgAbout.DoModal();
	}
	else
	{
		CDialog::OnSysCommand(nID, lParam);
	}
}

// If you add a minimize button to your dialog, you will need the code below
//  to draw the icon.  For MFC applications using the document/view model,
//  this is automatically done for you by the framework.

void CLGUApivcDlg::OnPaint() 
{
	if (IsIconic())
	{
		CPaintDC dc(this); // device context for painting

		SendMessage(WM_ICONERASEBKGND, (WPARAM) dc.GetSafeHdc(), 0);

		// Center icon in client rectangle
		int cxIcon = GetSystemMetrics(SM_CXICON);
		int cyIcon = GetSystemMetrics(SM_CYICON);
		CRect rect;
		GetClientRect(&rect);
		int x = (rect.Width() - cxIcon + 1) / 2;
		int y = (rect.Height() - cyIcon + 1) / 2;

		// Draw the icon
		dc.DrawIcon(x, y, m_hIcon);
	}
	else
	{
		CDialog::OnPaint();
	}
}

// The system calls this to obtain the cursor to display while the user drags
//  the minimized window.
HCURSOR CLGUApivcDlg::OnQueryDragIcon()
{
	return (HCURSOR) m_hIcon;
}
void CLGUApivcDlg::SetLogBox(CString msg) 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlLogBox.GetWindowText(m_strLogBoxStr);
	m_strLogBoxStr.Insert(0,"\r\n");
	m_strLogBoxStr.Insert(0,msg);
	m_ctlLogBox.SetWindowText(m_strLogBoxStr);
	UpdateData(false);
}
void CLGUApivcDlg::OnLoginBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.SetSeedEncryption();
	
	boolean ret=m_ctlOCX.LoginServer(m_strLoginID,m_strLoginPW,m_strLoginDomain);
}

void CLGUApivcDlg::OnClick2callBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.Click2Call(m_strCallNum,"","");
}

void CLGUApivcDlg::OnAnswerBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.Answer();
}

void CLGUApivcDlg::OnHangupBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.HangUp();
}

void CLGUApivcDlg::OnAtxferBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.AtXfer(m_strTransNum);
}

void CLGUApivcDlg::OnSendNotifyBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.SendPeerMsg("0","",m_strNotifyPeers,m_strNotifyMsg);
}


void CLGUApivcDlg::OnByeBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.DisconnectServer();
}

void CLGUApivcDlg::OnPickupBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.Pickup(m_strCallNum);
}

void CLGUApivcDlg::OnRejectBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.HangUp();
}

void CLGUApivcDlg::OnHangupBtn2() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.HangUpDst();
}

void CLGUApivcDlg::OnHoldBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.Hold();
}

void CLGUApivcDlg::OnUnholdBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.Unhold();
}

void CLGUApivcDlg::OnSrecordBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.StartRecord();
}

void CLGUApivcDlg::OnErecordBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.StopRecord();
}

void CLGUApivcDlg::OnTransBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.Transfer(m_strTransNum);
}

void CLGUApivcDlg::OnConfBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);

	m_ctlOCX.RedirectConference(m_strLoginID);
}

void CLGUApivcDlg::OnConfinvBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.InviteConference(m_strLoginID,m_strConfInvPeer);
}

void CLGUApivcDlg::OnPeerinfosBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.GetPeerInfo(m_strPeerInfos);
}

void CLGUApivcDlg::OnSendSmsBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
//var type="0";//예약:1
//	var typeinfo="0";//예약시 예약시간 년월일 시:분:00
m_ctlOCX.SendSMS("0","0",m_strSmsNums,m_strSmsMsg);	
}

void CLGUApivcDlg::OnUserinfoBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(TRUE);
	m_ctlOCX.SetUserInfo(m_strUserInfoCombo,m_strUserInfoVal);
}

void CLGUApivcDlg::OnForwardSetBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(TRUE);
	CString type="";
	if(m_strForwardCombo == "0:무조건")
		type="0";
	else if(m_strForwardCombo == "1:무응답")
		type="1";
	else if(m_strForwardCombo == "2:통화중")
		type="2";
	else if(m_strForwardCombo == "3:동시링")
		type="3";
	else{
		AfxMessageBox(m_strForwardCombo);
		AfxMessageBox("TypeError!");
		return ;
	}
	m_ctlOCX.SetForward("1",type,m_strForwardNum,m_strForwardStart,m_strForwardEnd,"");
}

void CLGUApivcDlg::OnForwardClearBtn() 
{
	// TODO: Add your control notification handler code here
	m_ctlOCX.SetForward("0","","","","","");
}

void CLGUApivcDlg::OnHistoryBtn() 
{
	// TODO: Add your control notification handler code here
	UpdateData(TRUE);
	CString ser="";
	CString cat="";
	CString inout="";
	int nFind=0;
	nFind=m_strHistoryCatCombo.Find(":",0);
	if(nFind>0) cat=m_strHistoryCatCombo.Left(nFind);
	AfxMessageBox(cat);
	nFind=m_strHistoryInoutCombo.Find(":",0);
	if(nFind>0) inout=m_strHistoryInoutCombo.Left(nFind);
	AfxMessageBox(inout);
	nFind=m_strHistorySearchCombo.Find(":",0);
	if(nFind>0) ser=m_strHistorySearchCombo.Left(nFind);
	AfxMessageBox(ser);
	if(ser.IsEmpty()||cat.IsEmpty()||inout.IsEmpty()){
		AfxMessageBox("입력값에러");
		return;
	}
//	m_ctlOCX.GetCallHistory(cat,inout,m_strHistoryStart,m_strHistoryEnd,ser);
}

void CLGUApivcDlg::OnPeerstatusBtn2() 
{
	// TODO: Add your control notification handler code here
		UpdateData(true);
	m_ctlOCX.GetStatusPeers(m_strPeerInfos,"");
}
void CLGUApivcDlg::OnCallwithconf() 
{
	// TODO: Add your control notification handler code here
	UpdateData(true);
	m_ctlOCX.CallWithConference(m_strLoginID,m_strCallWithConf);
}
BEGIN_EVENTSINK_MAP(CLGUApivcDlg, CDialog)
    //{{AFX_EVENTSINK_MAP(CLGUApivcDlg)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 105 /* SendLoginResultEvent */, OnSendLoginResultEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 101 /* SendRingEvent */, OnSendRingEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 102 /* SendChannelListEvent */, OnSendChannelListEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 103 /* SendChannelOutEvent */, OnSendChannelOutEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 104 /* SendNetworkErrorEvent */, OnSendNetworkErrorEventLgubaseopenapictrl1, VTS_NONE)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 106 /* SendCommandResultEvent */, OnSendCommandResultEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 108 /* SendSMSEvent */, OnSendSMSEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 109 /* SendPeerMsgEvent */, OnSendPeerMsgEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 110 /* SendDtmfEvent */, OnSendDtmfEventLgubaseopenapictrl1, VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 111 /* SendCmdErrorEvent */, OnSendCmdErrorEventLgubaseopenapictrl1, VTS_PBSTR VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, 107 /* SendEtcEvent */, OnSendEtcEventLgubaseopenapictrl1, VTS_PBSTR VTS_PBSTR)
	ON_EVENT(CLGUApivcDlg, IDC_LGUBASEOPENAPICTRL1, -609 /* ReadyStateChange */, OnReadyStateChangeLgubaseopenapictrl1, VTS_NONE)
	//}}AFX_EVENTSINK_MAP
END_EVENTSINK_MAP()

void CLGUApivcDlg::OnSendLoginResultEventLgubaseopenapictrl1(BSTR FAR* bstrLoginResult) 
{
	CString str;
	str = (LPCWSTR)*bstrLoginResult;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendRingEventLgubaseopenapictrl1(BSTR FAR* bstrRingEvent) 
{
	CString str;
	str = (LPCWSTR)*bstrRingEvent;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendChannelListEventLgubaseopenapictrl1(BSTR FAR* bstrChannelList) 
{
	CString str;
	str = (LPCWSTR)*bstrChannelList;
	// TODO: Add your control notification handler code here
	SetLogBox(str);	
}

void CLGUApivcDlg::OnSendChannelOutEventLgubaseopenapictrl1(BSTR FAR* bstrChannelOut) 
{
	CString str;
	str = (LPCWSTR)*bstrChannelOut;
	// TODO: Add your control notification handler code here
	SetLogBox(str);	
}

void CLGUApivcDlg::OnSendNetworkErrorEventLgubaseopenapictrl1() 
{
	// TODO: Add your control notification handler code here
	CString msg="Disconnected";
	SetLogBox(msg);	
}

void CLGUApivcDlg::OnSendCommandResultEventLgubaseopenapictrl1(BSTR FAR* bstrCommandResult) 
{
	CString str;
	str = (LPCWSTR)*bstrCommandResult;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendSMSEventLgubaseopenapictrl1(BSTR FAR* bstrSMSValue) 
{
	CString str;
	str = (LPCWSTR)*bstrSMSValue;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendPeerMsgEventLgubaseopenapictrl1(BSTR FAR* bstrMsgValue) 
{
	CString str;
	str = (LPCWSTR)*bstrMsgValue;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendDtmfEventLgubaseopenapictrl1(BSTR FAR* bstrMsgValue) 
{
	CString str;
	str = (LPCWSTR)*bstrMsgValue;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendCmdErrorEventLgubaseopenapictrl1(BSTR FAR* bstrEventName, BSTR FAR* bstrMsgValue) 
{
	CString str;
	str = (LPCWSTR)*bstrMsgValue;
	// TODO: Add your control notification handler code here
	SetLogBox(str);
}

void CLGUApivcDlg::OnSendEtcEventLgubaseopenapictrl1(BSTR FAR* bstrEventName, BSTR FAR* bstrEventValue) 
{
	CString str;
	str = (LPCWSTR)*bstrEventValue;
	// TODO: Add your control notification handler code here
		SetLogBox(str);
}

void CLGUApivcDlg::OnReadyStateChangeLgubaseopenapictrl1() 
{
	// TODO: Add your control notification handler code here
	
}




