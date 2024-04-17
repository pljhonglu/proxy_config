function change_me_body(body) {
    try {
        let body_obj = JSON.parse(body);
        // Show walkthrough
        body_obj = {
            ...body_obj,
            eligible_for_pro_features : true,
            has_active_subscription : true,
            eligible_for_ai : true,
            eligible_for_gpt4 : true,
            eligible_for_ai_citations : true,
            eligible_for_developer_hub : true,
            eligible_for_application_settings : true,
            eligible_for_cloud_sync : true,
            eligible_for_ai_citations : true,
            eligible_for_bext : true,
            publishing_bot : true,
            has_pro_features : true,
            has_better_ai : true,
            has_running_subscription : true,
            can_upgrade_to_pro : false,
            can_upgrade_to_better_ai : false,
            can_use_referral_codes : true,
            can_manage_billing : false,
            can_cancel_subscription : false,
            can_view_billing : false,
            admin : true,
            // 为了移除自己界面的订阅字样
            subscription : null,
            stripe_subscription_id : null,
            stripe_subscription_status : null,
            stripe_subscription_interval : null,
            stripe_subscription_current_period_end : null,
        }
        let new_body_str = JSON.stringify(body_obj)
        console.log(new_body_str);
        $done({ body: new_body_str });
    } catch (err) {
        console.log("aaaaa!!!!\n" + err);
        $done({});
    }
}

function change_get_sync_body(url_str){
    // https://backend.raycast.com/api/v1/me/sync?after=2024-02-02T02:27:01.141195Z

    let sync_data = $persistentStore.read("raycast_sync_data");
    if (!sync_data){
        $done({body: JSON.stringify({updated: [], updated_at: null, deleted: []})});
        return
    }
    const url = new URL(url_str);
    const params = new URLSearchParams(url.search);
    const after_value = params.get("after");

    let resp = sync_data
    if (after_value) {
        const after_date = Date.parse(after_value);
        sync_data = JSON.parse(sync_data)
        const updated = sync_data.updated.filter((item) => {
            const updated_at = new Date(item.updated_at)
            return updated_at > after_date
        })
        sync_data.updated = updated
        resp = JSON.stringify(sync_data)
    } else {
        console.log("No 'after' parameter found in the URL.");
    }
    // console.log(resp)
    $done({body:resp})
}

function change_put_sync_body(body){
    const updated_at = new Date().toISOString()
    const body_obj = JSON.parse(body);
    const bodyDeleted = body.deleted? body.deleted : []
    body_obj.deleted = []
    body_obj.updated_at = updated_at


    let sync_data = $persistentStore.read("raycast_sync_data");
    if (!sync_data){
        for (const item of body_obj.updated) {
            item.updated_at = updated_at
            item.created_at = item.client_updated_at
        }
        $persistentStore.write(JSON.stringify(body_obj), "raycast_sync_data");
    }else{
        let updated = body_obj.updated.filter((item) => !bodyDeleted.includes(item.id))
        for (const item of body_obj.updated) {
            item.updated_at = updated_at
            item.created_at = item.client_updated_at
        }
        updated = updated.concat(body_obj.updated)
        body_obj.updated = updated
        $persistentStore.write(JSON.stringify(body_obj), "raycast_sync_data");
    }
    const resp = JSON.stringify({updated_at:updated_at})
    console.log(resp)
    $done({body:resp})
}

function main() {
    let url = $request.url
    let method = $request.method
    console.log(`[${method}]: ${url}`)
    if (url.includes("/api/v1/me/sync")) {
        if (method == "GET"){
            change_get_sync_body(url)
            return
        }else if (method == "PUT"){
            change_put_sync_body($request.body)
            return
        }
    }else if (url.includes("/api/v1/me")) {
        change_me_body($response.body);
        return
    } 
    $done({})
}

main()

