import json
from datetime import datetime, timezone
import os
from apify_client import ApifyClient # Ensure you have this installed: pip install apify-client
from dotenv import load_dotenv # Import the function

# Load environment variables from .env file
load_dotenv() # This line loads the variables

# Now APIFY_API_TOKEN will be loaded if it's in your .env file
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")

def simplify_ad_data(raw_ad_item, scrape_date_str):
    """
    Simplifies a single ad item from the raw Apify Facebook Ad Library scraper output.
    Assumes scrape_date_str is in 'YYYY-MM-DD' format.
    """
    snapshot = raw_ad_item.get("snapshot", {})
    if not snapshot: # If there's no snapshot data, we can't process much
        print(f"Warning: Ad item with ID {raw_ad_item.get('ad_archive_id')} has no snapshot. Skipping.")
        return None

    try:
        scrape_datetime = datetime.strptime(scrape_date_str, "%Y-%m-%d")
        scrape_timestamp = int(scrape_datetime.replace(tzinfo=timezone.utc).timestamp())
    except ValueError:
        print(f"Error: Invalid scrape_date_str format: {scrape_date_str}. Expected YYYY-MM-DD.")
        # Fallback to current time if format is incorrect, though this should be controlled by the calling function
        scrape_datetime = datetime.now(timezone.utc)
        scrape_timestamp = int(scrape_datetime.timestamp())
        print(f"Warning: Using current timestamp as fallback for scrape_timestamp for ad {raw_ad_item.get('ad_archive_id')}.")


    media_urls = []
    # Ensure snapshot.get returns a list or an empty list to iterate safely
    images_data = snapshot.get("images", [])
    if images_data: # Check if images_data is not None and not empty
        for img in images_data:
            if isinstance(img, dict): # Ensure img is a dictionary
                if img.get("original_image_url"):
                    media_urls.append(img["original_image_url"])
                elif img.get("resized_image_url"):
                    media_urls.append(img["resized_image_url"])

    videos_data = snapshot.get("videos", [])
    if videos_data: # Check if videos_data is not None and not empty
        for vid in videos_data:
            if isinstance(vid, dict): # Ensure vid is a dictionary
                if vid.get("video_hd_url"):
                    media_urls.append(vid["video_hd_url"])
                elif vid.get("video_sd_url"):
                    media_urls.append(vid["video_sd_url"])

    cards_data = snapshot.get("cards", [])
    if cards_data: # Check if cards_data is not None and not empty
        for card in cards_data:
            if isinstance(card, dict): # Ensure card is a dictionary
                if card.get("original_image_url"):
                    media_urls.append(card["original_image_url"])
                # Add video URLs from cards if the structure supports it
                if card.get("video_hd_url"): # Check your specific JSON structure for videos in cards
                     media_urls.append(card["video_hd_url"])
                elif card.get("video_sd_url"):
                     media_urls.append(card["video_sd_url"])


    start_timestamp = raw_ad_item.get("start_date")
    end_timestamp = raw_ad_item.get("end_date")
    total_active_time_seconds = raw_ad_item.get("total_active_time")
    is_active = raw_ad_item.get("is_active", False)

    start_date_readable = ""
    if start_timestamp:
        try:
            start_date_readable = datetime.fromtimestamp(start_timestamp, timezone.utc).strftime('%Y-%m-%d')
        except (OSError, OverflowError, TypeError) as e:
            print(f"Warning: Invalid start_timestamp {start_timestamp} for ad {raw_ad_item.get('ad_archive_id')}: {e}")


    end_date_readable = ""
    if end_timestamp:
        try:
            if is_active and start_timestamp and (end_timestamp - scrape_timestamp > 365 * 24 * 60 * 60):
                end_date_readable = "Ongoing (Far Future)"
            else:
                end_date_readable = datetime.fromtimestamp(end_timestamp, timezone.utc).strftime('%Y-%m-%d')
        except (OSError, OverflowError, TypeError) as e:
             print(f"Warning: Invalid end_timestamp {end_timestamp} for ad {raw_ad_item.get('ad_archive_id')}: {e}")
    elif is_active:
        end_date_readable = "Ongoing"


    duration_days = None
    if total_active_time_seconds is not None:
        try:
            duration_days = round(float(total_active_time_seconds) / (60 * 60 * 24), 2)
        except (ValueError, TypeError) as e:
            print(f"Warning: Invalid total_active_time_seconds {total_active_time_seconds} for ad {raw_ad_item.get('ad_archive_id')}: {e}")
    elif start_timestamp:
        current_or_end_ts = scrape_timestamp
        if not is_active and end_timestamp and end_timestamp < scrape_timestamp:
            current_or_end_ts = end_timestamp
        elif is_active and end_timestamp and end_timestamp < scrape_timestamp:
            current_or_end_ts = end_timestamp

        if current_or_end_ts >= start_timestamp:
            duration_days = round((current_or_end_ts - start_timestamp) / (60 * 60 * 24), 2)
        else:
            duration_days = 0

    if duration_days is not None and duration_days < 0:
        duration_days = 0

    ad_archive_id_val = raw_ad_item.get("ad_archive_id")
    ad_library_url_val = f"https://www.facebook.com/ads/library/?id={ad_archive_id_val}" if ad_archive_id_val else raw_ad_item.get("url", "")

    # Safely get ad_body_text
    snapshot_body = snapshot.get("body")
    ad_body_text_val = None
    if isinstance(snapshot_body, dict): # Check if snapshot_body is a dictionary
        ad_body_text_val = snapshot_body.get("text")
    elif isinstance(snapshot_body, str): # In some rare cases, body itself might be the text
        ad_body_text_val = snapshot_body


    simplified_item = {
        "ad_archive_id": ad_archive_id_val,
        "advertiser_name": snapshot.get("page_name"),
        "advertiser_page_id": snapshot.get("page_id"),
        "ad_headline": snapshot.get("title"),
        "ad_body_text": ad_body_text_val, # Use the safely retrieved value
        "ad_display_format": snapshot.get("display_format"),
        "ad_media_urls": list(set(media_urls)),
        "call_to_action_text": snapshot.get("cta_text"),
        "landing_page_url": snapshot.get("link_url"),
        "ad_library_url": ad_library_url_val,
        "start_date_readable": start_date_readable,
        "end_date_readable": end_date_readable,
        "duration_days": duration_days,
        "is_active": is_active,
        "publisher_platforms": raw_ad_item.get("publisher_platform", []),
        "advertiser_page_likes": snapshot.get("page_like_count"),
        "ad_category_tags": raw_ad_item.get("categories", [])
    }
    return simplified_item

def fetch_and_parse_apify_data(apify_token_param, actor_id, actor_run_input, output_filepath):
    """
    Runs an Apify actor, fetches its results, simplifies them, and saves to a file.
    """
    if not apify_token_param:
        print("Error: Apify token is missing in fetch_and_parse_apify_data.")
        return
    try:
        client = ApifyClient(apify_token_param)
        print(f"Running Apify Actor: {actor_id}...")

        run = client.actor(actor_id).call(run_input=actor_run_input)

        dataset_id = run.get("defaultDatasetId")
        if not dataset_id:
            print("Error: Could not get dataset ID from actor run.")
            print(f"Actor run details: {run}")
            return

        print(f"Actor run initiated. Run ID: {run.get('id')}, Dataset ID: {dataset_id}")
        print(f"Waiting for actor run to finish and fetching items from dataset {dataset_id}...")

        simplified_ads = []
        current_scrape_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')

        item_count_total = 0
        processed_item_count = 0
        for item_count, item in enumerate(client.dataset(dataset_id).iterate_items()):
            item_count_total = item_count + 1
            if item_count_total % 20 == 0 : # Log progress more frequently if needed
                 print(f"Retrieved item {item_count_total}. Processing...")
            simplified_item = simplify_ad_data(item, current_scrape_date)
            if simplified_item:
                simplified_ads.append(simplified_item)
                processed_item_count +=1

        print(f"\nTotal items retrieved from dataset: {item_count_total}")
        if not simplified_ads:
            print("No items were successfully processed into the simplified format from the Actor run's dataset.")
            return

        with open(output_filepath, 'w', encoding='utf-8') as f:
            json.dump(simplified_ads, f, indent=2, ensure_ascii=False)
        print(f"Successfully processed {processed_item_count} ads into simplified format.")
        print(f"Simplified data saved to: {output_filepath}")

    except Exception as e:
        print(f"An error occurred during Apify operation or data processing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print(f"Loaded APIFY_API_TOKEN: '{APIFY_API_TOKEN[:5]}...' (partially hidden for security)")


    APIFY_ACTOR_ID = "XtaWFhbtfxyzqrFmd" # From your example

    ACTOR_RUN_INPUT = {
        "urls": [
            { "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=%22senior%20home%20care%22&search_type=keyword_exact_phrase&media_type=all" }
        ],
        "count": 30,  # Reduced count for faster testing, increase as needed (e.g., 100)
        "scrapePageAds.activeStatus": "all",
    }

    OUTPUT_JSON_FILE = "simplified_senior_home_care_ads_live.json"

    if not APIFY_API_TOKEN:
        print("Error: APIFY_API_TOKEN environment variable is not set or not loaded. Please check your .env file and ensure it's in the same directory as the script.")
    else:
        fetch_and_parse_apify_data(APIFY_API_TOKEN, APIFY_ACTOR_ID, ACTOR_RUN_INPUT, OUTPUT_JSON_FILE)